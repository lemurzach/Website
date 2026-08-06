import { google } from "googleapis";
import { prisma } from "@/lib/db";

class GmailSendError extends Error {}

async function getAuthorizedGmailClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.refresh_token && !account?.access_token) {
    throw new GmailSendError(
      "No Google account connected — sign out and sign back in to grant Gmail access."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  oauth2Client.on("tokens", (tokens) => {
    prisma.account
      .update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token ?? account.access_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : account.expires_at,
          ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
        },
      })
      .catch(() => {
        // Best-effort persistence of refreshed tokens; the send itself
        // still succeeds even if this write fails.
      });
  });

  // Forces a refresh if the cached access token is expired.
  await oauth2Client.getAccessToken();

  return google.gmail({ version: "v1", auth: oauth2Client });
}

function buildRawMessage(input: {
  fromName: string | null;
  toEmail: string;
  subject: string;
  body: string;
}): string {
  const headers = [
    input.fromName ? `From: ${input.fromName}` : undefined,
    `To: ${input.toEmail}`,
    `Subject: ${input.subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
  ].filter(Boolean);

  const message = `${headers.join("\r\n")}\r\n\r\n${input.body}`;

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendDraftViaGmail(draftId: string, sendingUserId: string) {
  const draft = await prisma.emailDraft.findUniqueOrThrow({
    where: { id: draftId },
    include: { prospect: true },
  });

  if (!draft.prospect.contactEmail) {
    throw new GmailSendError(
      "This prospect has no contact email on file — add one before sending."
    );
  }

  const sender = await prisma.user.findUniqueOrThrow({ where: { id: sendingUserId } });

  const gmail = await getAuthorizedGmailClient(sendingUserId);
  const raw = buildRawMessage({
    fromName: sender.name,
    toEmail: draft.prospect.contactEmail,
    subject: draft.subject,
    body: draft.body,
  });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}
