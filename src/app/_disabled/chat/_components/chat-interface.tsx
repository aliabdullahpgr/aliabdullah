"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";

interface Message {
  role: "user" | "agent";
  text: string;
}

function ToolCard({ kind }: { kind: "message" | "meeting" }) {
  const isMeeting = kind === "meeting";
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("awaiting input");

  const { data: configs } = api.siteConfig.getManyByKeys.useQuery({
    keys: ["contact.email"],
  });
  const email =
    configs?.find((c) => c.key === "contact.email")?.value ??
    "aliabdullah3676@gmail.com";

  return (
    <div className="tool-card">
      <div className="tool-head">
        <span>
          {isMeeting ? "◇ Tool — schedule_meeting" : "◇ Tool — send_message"}
        </span>
        <span className="status">{status}</span>
      </div>
      <div className="tool-body">
        {isMeeting
          ? "Pick a topic and I'll open a calendar invite draft addressed to Ali."
          : "Write a short note. I'll deliver it to Ali's inbox."}
      </div>
      <textarea
        placeholder={
          isMeeting
            ? "What is the call about? (e.g. freelance React project, 30 min next week)"
            : "Your message — keep it brief."
        }
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={status !== "awaiting input"}
      />
      <div className="tool-actions">
        <button
          type="button"
          className="tool-btn primary"
          disabled={status !== "awaiting input"}
          onClick={() => {
            const v = value.trim();
            if (!v) return;
            const subject = isMeeting ? "30-min call" : "Hello from your site";
            const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(v)}`;
            window.location.href = url;
            setStatus("sent → mail client");
          }}
        >
          {isMeeting ? "Open invite" : "Send"}
        </button>
        <button
          type="button"
          className="tool-btn"
          disabled={status !== "awaiting input"}
          onClick={() => setStatus("cancelled")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: suggestions } = api.chat.getSuggestions.useQuery();
  const { data: responses } = api.chat.getResponses.useQuery();

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  function autosize() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }

  useEffect(() => {
    autosize();
  }, [input]);

  async function ask(q: string, toolHint?: "message" | "meeting") {
    setShowIntro(false);
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setThinking(true);

    try {
      await new Promise((r) => setTimeout(r, 1200));

      let reply = "";
      const lowerQ = q.toLowerCase();

      // Check dynamic responses first
      const matchedResponse = responses?.find((r) =>
        lowerQ.includes(r.trigger.toLowerCase()),
      );

      if (matchedResponse) {
        reply = matchedResponse.response;
      } else if (toolHint) {
        reply = `[[TOOL:${toolHint}]]\nSure — fill this in:`;
      } else if (lowerQ.includes("message") || lowerQ.includes("email")) {
        reply = "[[TOOL:message]]\nSure — fill this in:";
      } else if (
        lowerQ.includes("schedule") ||
        lowerQ.includes("call") ||
        lowerQ.includes("meeting")
      ) {
        reply = "[[TOOL:meeting]]\nSure — fill this in:";
      } else {
        reply = "I'm not sure about that — you'd have to ask him directly.";
      }

      setThinking(false);

      const toolMatch = /\[\[TOOL:(message|meeting)\]\]/.exec(reply);
      const cleaned = reply
        .replace(/\[\[TOOL:(message|meeting)\]\]/g, "")
        .trim();
      const finalTool = toolMatch ? toolMatch[1] : toolHint;

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: cleaned || (finalTool ? "Sure — fill this in:" : ""),
        },
      ]);

      if (finalTool) {
        setMessages((prev) => [
          ...prev,
          { role: "agent", text: `__TOOL:${finalTool}__` },
        ]);
      }
    } catch {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "Something went wrong. Try again, or email directly.",
        },
      ]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    void ask(q);
  }

  return (
    <>
      <div className="thread" ref={threadRef}>
        {showIntro && (
          <div className="intro">
            <div className="hint">Try one of these</div>
            <div className="suggest">
              {suggestions?.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    ask(
                      s.question,
                      (s.tool as "message" | "meeting") ?? undefined,
                    )
                  }
                >
                  <span>{s.question}</span>
                  <span className={s.kind === "tool" ? "kind tool" : "kind"}>
                    {s.kind}
                  </span>
                  <span className="arr">→</span>
                </button>
              ))}
              {!suggestions?.length && (
                <p className="text-muted-foreground text-sm">
                  No suggestions configured.
                </p>
              )}
            </div>
          </div>
        )}
        {messages.map((m, i) => {
          if (m.text.startsWith("__TOOL:")) {
            const tool = m.text.replace("__TOOL:", "").replace("__", "") as
              | "message"
              | "meeting";
            return <ToolCard key={i} kind={tool} />;
          }
          return (
            <div className={`msg ${m.role}`} key={i}>
              <div className="who">{m.role === "user" ? "You" : "Agent"}</div>
              <div className="body">
                {m.text.split(/\n{2,}/).map((p, pi) => (
                  <p key={pi}>
                    {p.split("\n").map((line, li) => (
                      <span key={li}>
                        {line}
                        {li < p.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
        {thinking && (
          <div className="msg agent">
            <div className="who">Agent</div>
            <div className="body">
              <span className="thinking">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="composer-wrap">
        <form className="composer" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            placeholder="Ask anything…"
            rows={1}
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button className="send" type="submit" disabled={thinking}>
            Send →
          </button>
        </form>
        <div className="composer-meta">
          <span>
            <kbd>Enter</kbd> send · <kbd>⇧ Enter</kbd> newline
          </span>
        </div>
      </div>
    </>
  );
}
