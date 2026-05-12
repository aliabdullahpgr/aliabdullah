import { redirect } from "next/navigation";
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import ChatManager from "./_components/chat-manager";

export default async function ChatDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">
          Manage chat suggestions, bot responses, and chat page settings.
        </p>
      </div>
      <ChatManager />
    </div>
  );
}
