import { signIn } from "@/auth";

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const params = await searchParams;
  const callbackUrl =
    typeof params.callbackUrl === "string" ? params.callbackUrl : "/";

  return (
    <div className="signin-page">
      <div>
        <h1>Outreach Copilot</h1>
        <p className="subtitle">Sign in with your work Google account.</p>
      </div>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: callbackUrl });
        }}
      >
        <button type="submit" className="google-signin-button">
          Sign in with Google
        </button>
      </form>
      <p className="subtitle" style={{ maxWidth: 380 }}>
        This grants permission to send approved drafts from your own Gmail —
        outreach comes from your real inbox, not a shared sending address.
      </p>
    </div>
  );
}
