import {
  answerWithGroq,
  getSession,
  recordMessage,
  sendJson,
} from "./_lib.mjs";

export default async function handler(request, response) {
  try {
    const session = getSession(request, response);

    if (request.method === "GET") {
      return sendJson(response, 200, {
        messages: session.map(({ id, role, content }) => ({ id, role, text: content })),
      });
    }

    if (request.method !== "POST") {
      return sendJson(response, 405, { error: "Method not allowed." });
    }

    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body ?? {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 2000) {
      return sendJson(response, 400, { error: "Message must be between 1 and 2000 characters." });
    }

    const previous = session.slice(-12).map(({ role, content }) => ({ role, content }));
    const answer = await answerWithGroq(previous, message, body.weather);
    recordMessage(session, "user", message);
    recordMessage(session, "assistant", answer);

    return sendJson(response, 200, { response: answer });
  } catch (error) {
    console.error("Chat API error:", error);
    return sendJson(response, error.status ?? 500, {
      error: error instanceof SyntaxError ? "Invalid JSON." : error.message,
    });
  }
}
