// Placeholder landing page. Real marketing page and app shell come in later phases (see PLAN.md).
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        {process.env.NEXT_PUBLIC_APP_NAME ?? "Local Reputation"}
      </h1>
      <p className="text-muted-foreground max-w-md">
        Reviews, social posts and listings for local businesses. Scaffold only —
        see PLAN.md for the build phases.
      </p>
    </main>
  );
}
