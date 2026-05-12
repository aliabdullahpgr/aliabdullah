import { Nav } from "~/app/_components/nav";
import { ChatInterface } from "./_components/chat-interface";
import { api } from "~/trpc/server";

export const metadata = {
  title: "Chat — Ali Abdullah",
};

export default async function ChatPage() {
  const config = await api.chat.getConfig();

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
          <ChatInterface />
        </div>
      </main>
    </>
  );
}
