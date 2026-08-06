import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      authorization: {
        params: {
          // gmail.send lets the app send the approved draft from the
          // signed-in rep's own inbox — the deliverability strategy.
          scope: "openid email profile https://www.googleapis.com/auth/gmail.send",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.organizationId = user.organizationId;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email) return;
      const domain = user.email.split("@")[1]?.toLowerCase();
      if (!domain) return;

      const org = await prisma.organization.upsert({
        where: { domain },
        create: { domain },
        update: {},
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: org.id },
      });
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
