import {
  GoogleGenerativeAI,
  SchemaType,
  type Content,
  type FunctionDeclaration,
} from "@google/generative-ai";
import { db } from "~/server/db";
import { getChatResponse, setChatResponse } from "~/server/chat-cache";

export const runtime = "nodejs";

const tools: FunctionDeclaration[] = [
  {
    name: "send_message",
    description:
      "Send a message or inquiry to Ali Abdullah via email. Use this when the user wants to contact Ali, send a note, or get in touch.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        intent: {
          type: SchemaType.STRING,
          description:
            "A short description of the user's intent (e.g. 'freelance inquiry', 'collaboration request')",
        },
      },
      required: ["intent"],
    },
  },
  {
    name: "schedule_meeting",
    description:
      "Schedule a meeting or call with Ali Abdullah. Use this when the user wants to book a call, set up a meeting, or discuss something in real time.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        topic: {
          type: SchemaType.STRING,
          description: "What the meeting is about",
        },
      },
      required: ["topic"],
    },
  },
];

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

function buildHistory(messages: ChatMessage[]): Content[] {
  const history: Content[] = [];
  for (const m of messages) {
    history.push({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    });
  }
  return history;
}

function buildSystemPrompt(
  basePrompt: string,
  chatResponses: { trigger: string; response: string }[],
): string {
  const responsesBlock =
    chatResponses.length > 0
      ? `\n\nHere are specific answers to use when relevant topics come up:\n${chatResponses
          .map((r) => `- If asked about "${r.trigger}": ${r.response}`)
          .join("\n")}`
      : "";

  return (
    basePrompt ||
    `You are a friendly AI assistant representing Ali Abdullah, a Software Engineer based in Multan, Pakistan. \
You answer questions about Ali's work, skills, projects, and experience. \
Keep replies concise and conversational. \
If asked to send a message or schedule a meeting, use the appropriate tool.${responsesBlock}`
  );
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  let body: { messages: ChatMessage[]; userMessage: string };
  try {
    body = (await req.json()) as { messages: ChatMessage[]; userMessage: string };
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, userMessage } = body;
  if (!userMessage?.trim()) {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  // Check Redis cache for exact question match
  const normalizedPrompt = userMessage.trim();
  const cachedAnswer = await getChatResponse(normalizedPrompt);
  if (cachedAnswer) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", chunk: cachedAnswer })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  }

  const [config, chatResponses] = await Promise.all([
    db.chatConfig.findFirst(),
    db.chatResponse.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
  ]);

  const modelName = config?.modelName?.startsWith("gemini")
    ? config.modelName
    : "gemini-2.5-flash";

  const systemInstruction = buildSystemPrompt(
    config?.systemPrompt ?? "",
    chatResponses,
  );

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    tools: [{ functionDeclarations: tools }],
  });

  const history = buildHistory(messages);
  const chat = model.startChat({ history });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      let fullResponse = "";

      try {
        const result = await chat.sendMessageStream(userMessage);

        for await (const chunk of result.stream) {
          const calls = chunk.functionCalls();
          if (calls?.length) {
            for (const call of calls) {
              const name = call.name as "send_message" | "schedule_meeting";
              if (name === "send_message" || name === "schedule_meeting") {
                send({ type: "tool", name });
              }
            }
            break;
          }

          const text = chunk.text();
          if (text) {
            fullResponse += text;
            send({ type: "text", chunk: text });
          }
        }

        // Cache non-tool text responses for reuse
        if (fullResponse && !fullResponse.includes("__TOOL")) {
          void setChatResponse(normalizedPrompt, fullResponse);
        }

        send({ type: "done" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
