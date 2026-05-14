export const dynamic = "force-dynamic";

import { Nav } from "~/app/_components/nav";
import { ChatInterface } from "./_components/chat-interface";
import { getPublicChatConfig } from "~/server/public-cms";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata = {
  title: "Chat — Ali Abdullah",
};

export default async function ChatPage() {
  const config = await getPublicChatConfig();

  return (
    <>
      <Nav />
      <main className="chat-page">
        <div className="chat-shell">
          <div className="chat-head">
            <div className="title">
              <span className="dot"></span>
              {config.pageTitle ?? "Ask Ali anything"}
            </div>
            <div className="sub">
              <b>Model:</b> {config.modelName ?? "claude-3-5-sonnet"}
            </div>
          </div>
          <TRPCReactProvider>
            <ChatInterface />
          </TRPCReactProvider>
        </div>
      </main>
    </>
  );
}
