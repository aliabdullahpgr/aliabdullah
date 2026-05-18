"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";

interface Message {
  role: "user" | "agent";
  text: string;
  isError?: boolean;
}

function ToolCard({ kind }: { kind: "message" | "meeting" }) {
  const isMeeting = kind === "meeting";
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"awaiting input" | "sent → mail client" | "cancelled">("awaiting input");

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
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: suggestions, isLoading: loadingSuggestions, error: suggestionError } = api.chat.getSuggestions.useQuery();

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
    setLastQuestion(q);
    const prevMessages = messages;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setThinking(true);

    // Tool buttons bypass Gemini and render the card directly
    if (toolHint) {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Sure — fill this in:" },
        { role: "agent", text: `__TOOL:${toolHint}__` },
      ]);
      return;
    }

    await runQuery(q, prevMessages);
  }

  async function runQuery(q: string, prevMessages: Message[]) {
    setThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: prevMessages, userMessage: q }),
      });

      if (!res.ok || !res.body) throw new Error("Chat API failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let agentText = "";
      let toolName: "message" | "meeting" | null = null;

      setThinking(false);
      setMessages((prev) => [...prev, { role: "agent", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let event: Record<string, unknown>;
          try {
            event = JSON.parse(raw) as Record<string, unknown>;
          } catch {
            continue;
          }

          if (event.type === "text") {
            agentText += event.chunk as string;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "agent", text: agentText };
              return updated;
            });
          } else if (event.type === "tool") {
            toolName = event.name as "message" | "meeting";
          } else if (event.type === "error") {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "agent",
                text: "Something went wrong. Try again or email directly.",
              };
              return updated;
            });
          }
        }
      }

      if (toolName) {
        if (!agentText) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "agent",
              text: "Sure — fill this in:",
            };
            return updated;
          });
        }
        setMessages((prev) => [
          ...prev,
          { role: "agent", text: `__TOOL:${toolName}__` },
        ]);
      }
    } catch {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "Something went wrong.",
          isError: true,
        },
      ]);
    }
  }

  function retry() {
    if (!lastQuestion) return;
    const prev = messages.filter((m) => !m.isError).filter((m, i, arr) => i < arr.length - 1);
    setMessages(prev);
    void runQuery(lastQuestion, prev.filter((m) => m.role !== "agent"));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || thinking) return;
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
              {loadingSuggestions && (
                <div className="skeleton-row">
                  <span className="skel" style={{ width: "60%" }} />
                  <span className="skel" style={{ width: "30%" }} />
                </div>
              )}
              {suggestionError && (
                <p className="text-muted-foreground text-sm">Could not load suggestions.</p>
              )}
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
              {!suggestions?.length && !loadingSuggestions && !suggestionError && (
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
          if (m.isError) {
            return (
              <div className="msg agent error" key={i}>
                <div className="who">Agent</div>
                <div className="body">
                  <p>{m.text}</p>
                  <button
                    type="button"
                    className="retry-btn"
                    onClick={retry}
                    disabled={thinking}
                  >
                    Try again ↻
                  </button>
                </div>
              </div>
            );
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
          <button className="send" type="submit" disabled={thinking} style={thinking ? { cursor: "not-allowed", opacity: 0.5 } : undefined}>
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
