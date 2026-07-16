import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/context";
import { checkRateLimit } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
const MAX_QUESTION_LENGTH = 400;
const MAX_HISTORY_TURNS = 4;

type AskRequestBody = {
  question?: string;
  history?: { role: "user" | "assistant"; text: string }[];
};

function textStream(text: string) {
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return textStream(
      "AI mode is not configured on this deployment yet (missing GEMINI_API_KEY). Try `about`, `projects`, or `contact` instead.",
    );
  }

  let body: AskRequestBody;
  try {
    body = await request.json();
  } catch {
    return textStream("Malformed request. Try: ask <question>");
  }

  const question = (body.question ?? "").trim().slice(0, MAX_QUESTION_LENGTH);
  if (!question) {
    return textStream("Usage: ask <question> — e.g. ask what did you build at Credee?");
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    const retrySeconds = Math.ceil(rateLimit.retryAfterMs / 1000);
    return textStream(
      `Rate limit reached for AI mode. Try again in ~${retrySeconds}s, or use \`contact\` / \`about\` in the meantime.`,
    );
  }

  const history = (body.history ?? []).slice(-MAX_HISTORY_TURNS * 2).map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: String(turn.text).slice(0, MAX_QUESTION_LENGTH) }],
  }));

  const contents = [...history, { role: "user", parts: [{ text: question }] }];

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const requestBody = JSON.stringify({
    contents,
    systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 320,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const callGemini = () =>
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

  let upstream: globalThis.Response;
  try {
    upstream = await callGemini();
    // Gemini occasionally returns transient 503s under load; one quiet retry
    // keeps the terminal from surfacing a scary error for a blip.
    if (upstream.status === 503 || upstream.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      upstream = await callGemini();
    }
  } catch {
    return textStream("AI mode is temporarily unreachable. Try again shortly.");
  }

  if (!upstream.ok || !upstream.body) {
    return textStream(
      `AI mode returned an error (status ${upstream.status}). Try again shortly, or use \`about\` / \`projects\`.`,
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload);
              const parts = parsed?.candidates?.[0]?.content?.parts;
              const delta: string | undefined = Array.isArray(parts)
                ? parts.map((part: { text?: string }) => part.text ?? "").join("")
                : undefined;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // Ignore malformed SSE chunks; streaming is best-effort.
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
