import assert from "node:assert/strict";
import test, { before } from "node:test";

const BASE = process.env.CHAT_TEST_URL ?? "http://localhost:3000";
const URL = `${BASE}/api/chat`;

async function readSseStream(res) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const events = [];

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
      try {
        events.push(JSON.parse(raw));
      } catch {
        // ignore malformed line
      }
    }
  }
  return events;
}

// Skip the current test if the upstream Gemini API is rate-limited.
// Free tier is 5 req/min for gemini-2.5-flash, easy to trip in a full run.
function bailOnRateLimit(t, events) {
  const errEvt = events.find((e) => e.type === "error");
  if (errEvt && /429|quota|rate.?limit/i.test(errEvt.message ?? "")) {
    t.skip(`upstream rate limit: ${errEvt.message}`);
    return true;
  }
  return false;
}

before(async () => {
  // Fail fast with a clear message if the dev server isn't reachable.
  try {
    await fetch(BASE, { method: "GET" });
  } catch (err) {
    throw new Error(
      `Cannot reach ${BASE}. Start the dev server first (pnpm dev) ` +
        `or set CHAT_TEST_URL to a running instance. (${err.message})`,
    );
  }
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("POST /api/chat with valid prompt streams text and ends with done", async (t) => {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [],
      userMessage: "Reply with the single word: hello",
    }),
  });

  assert.equal(res.status, 200, "expected 200 OK");
  assert.match(
    res.headers.get("content-type") ?? "",
    /text\/event-stream/,
    "expected SSE content-type",
  );

  const events = await readSseStream(res);
  if (bailOnRateLimit(t, events)) return;

  const types = events.map((e) => e.type);
  assert.ok(types.includes("text"), "expected at least one 'text' event");
  assert.ok(types.includes("done"), "expected a terminating 'done' event");

  const fullText = events
    .filter((e) => e.type === "text")
    .map((e) => e.chunk)
    .join("");
  assert.ok(fullText.trim().length > 0, "model returned empty text");
});

test("POST /api/chat returns 400 when userMessage is empty", async () => {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [], userMessage: "" }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /empty/i);
});

test("POST /api/chat returns 400 when userMessage is whitespace only", async () => {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [], userMessage: "   \n\t  " }),
  });
  assert.equal(res.status, 400);
});

test("POST /api/chat returns 400 on malformed JSON body", async () => {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ this is not json",
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /invalid/i);
});

test("POST /api/chat honors prior conversation history", async (t) => {
  await sleep(13000); // pace under 5 req/min free-tier limit
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "user", text: "My favorite color is teal. Remember this." },
        {
          role: "agent",
          text: "Got it — your favorite color is teal.",
        },
      ],
      userMessage:
        "What color did I just tell you was my favorite? Answer with one word.",
    }),
  });

  assert.equal(res.status, 200);
  const events = await readSseStream(res);
  if (bailOnRateLimit(t, events)) return;

  const fullText = events
    .filter((e) => e.type === "text")
    .map((e) => e.chunk)
    .join("")
    .toLowerCase();

  assert.match(
    fullText,
    /teal/,
    `model did not use history; full reply was: "${fullText}"`,
  );
});

test("POST /api/chat emits a tool event when asked to send a message", async (t) => {
  await sleep(13000);
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [],
      userMessage:
        "Use the send_message tool to deliver a short note to Ali about a job offer.",
    }),
  });

  assert.equal(res.status, 200);
  const events = await readSseStream(res);
  if (bailOnRateLimit(t, events)) return;

  const toolEvt = events.find((e) => e.type === "tool");
  assert.ok(
    toolEvt,
    `expected a tool event; got: ${JSON.stringify(events.map((e) => e.type))}`,
  );
  assert.equal(toolEvt.name, "send_message");
});

test("POST /api/chat handles a meeting-scheduling request", async (t) => {
  await sleep(13000);
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [],
      userMessage:
        "I'd like to schedule a 30 minute call with Ali next week to discuss a project.",
    }),
  });

  assert.equal(res.status, 200);
  const events = await readSseStream(res);
  if (bailOnRateLimit(t, events)) return;

  // Tool selection by the LLM is non-deterministic. Accept either:
  //   (a) a schedule_meeting tool event (preferred), or
  //   (b) a text reply that mentions scheduling/meeting and ends cleanly.
  // What we're really verifying: the route doesn't crash on this prompt.
  const toolEvt = events.find((e) => e.type === "tool");
  if (toolEvt) {
    assert.equal(toolEvt.name, "schedule_meeting");
    return;
  }

  const fullText = events
    .filter((e) => e.type === "text")
    .map((e) => e.chunk)
    .join("")
    .toLowerCase();
  assert.match(
    fullText,
    /(schedul|meeting|call)/,
    `expected tool event or scheduling-related text; got: "${fullText}"`,
  );
});

test("GET /api/chat is not allowed (POST-only route)", async () => {
  const res = await fetch(URL, { method: "GET" });
  // Next.js returns 405 for missing method handlers.
  assert.equal(res.status, 405);
});
