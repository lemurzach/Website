import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth, signOut } from "@/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Outreach Copilot",
  description: "Research-grounded, personalized cold outreach.",
};

async function Header() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="app-header">
      <span className="app-header-user">{session.user.email}</span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/sign-in" });
        }}
      >
        <button type="submit" className="link-button">
          Sign out
        </button>
      </form>
    </header>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
