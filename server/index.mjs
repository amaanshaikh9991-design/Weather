import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(new URL("../.env", import.meta.url))) {
  const envFile = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

const port = Number(process.env.PORT ?? 3001);
const sessions = new Map();
const COOKIE_NAME = "weather_session";
const MAX_MESSAGES = 40;

function parseCookies(request) {
  return Object.fromEntries(
    (request.headers.cookie ?? "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
}

function getSession(request, response) {
  const cookies = parseCookies(request);
  let sessionId = cookies[COOKIE_NAME];
  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = randomUUID();
    sessions.set(sessionId, []);
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    response.setHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure}`
    );
  }
  return sessions.get(sessionId);
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function xmlValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return match
    ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim()
    : "";
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const radians = (value) => (value * Math.PI) / 180;
  const a =
    Math.sin(radians(lat2 - lat1) / 2) ** 2 +
    Math.cos(radians(lat1)) *
      Math.cos(radians(lat2)) *
      Math.sin(radians(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function severityFromText(value) {
  const text = value.toLowerCase();
  if (/extreme|catastrophic|red|severe/.test(text)) return "extreme";
  if (/high|warning|orange/.test(text)) return "high";
  if (/moderate|watch|yellow/.test(text)) return "moderate";
  return "low";
}

async function fetchOfficialAlerts(latitude, longitude) {
  const alerts = [];

  if (latitude >= 24.396 && latitude <= 49.384 && longitude >= -125 && longitude <= -66.5) {
    const response = await fetch(
      `https://api.weather.gov/alerts/active?point=${encodeURIComponent(`${latitude},${longitude}`)}`,
      { headers: { "User-Agent": "WeatherGPT/1.0 weather-alerts" } }
    );
    const contentType = response.headers.get("content-type") ?? "";
    if (response.ok && contentType.includes("application/json")) {
      const data = await response.json();
      for (const feature of data.features ?? []) {
        const properties = feature.properties ?? {};
        alerts.push({
          id: `nws-${properties.id ?? randomUUID()}`,
          type: properties.event ?? "Weather alert",
          title: properties.headline ?? properties.event ?? "Official weather alert",
          severity: severityFromText(`${properties.severity} ${properties.urgency} ${properties.event}`),
          latitude,
          longitude,
          affectedArea: properties.areaDesc ?? "Point location",
          issuedAt: properties.sent ?? new Date().toISOString(),
          expiresAt: properties.expires ?? undefined,
          source: "US National Weather Service",
          sourceUrl: properties.web ?? properties["@id"],
          description: properties.description ?? properties.instruction ?? "",
        });
      }
    } else if (!response.ok) {
      console.warn("Official NWS alerts request failed:", response.status);
    }
  }

  const gdacsResponse = await fetch("https://www.gdacs.org/xml/rss.xml");
  if (gdacsResponse.ok) {
    const xml = await gdacsResponse.text();
    for (const item of xml.match(/<item[\s\S]*?<\/item>/gi) ?? []) {
      const point = xmlValue(item, "georss:point").split(/\s+/).map(Number);
      if (
        point.length !== 2 ||
        point.some(Number.isNaN) ||
        distanceKm(latitude, longitude, point[0], point[1]) > 1000
      ) {
        continue;
      }
      const title = xmlValue(item, "title");
      const description = stripHtml(xmlValue(item, "description"));
      alerts.push({
        id: `gdacs-${xmlValue(item, "guid") || title}`,
        type: title.split(":")[0] || "Global disaster event",
        title,
        severity: severityFromText(`${title} ${description}`),
        latitude: point[0],
        longitude: point[1],
        affectedArea: "Within approximately 1,000 km of the selected location",
        issuedAt: xmlValue(item, "pubDate") || new Date().toISOString(),
        source: "GDACS (UN) global disaster monitoring",
        sourceUrl: xmlValue(item, "link"),
        description,
      });
    }
  }

  return alerts.slice(0, 20);
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 100_000) throw new Error("Request body is too large.");
  }
  return JSON.parse(body || "{}");
}

function weatherContext(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return "Live weather context is unavailable.";
  return JSON.stringify(snapshot);
}

async function answerWithGroq(history, message, snapshot) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const error = new Error("GROQ_API_KEY is not configured on the server.");
    error.status = 503;
    throw error;
  }

  const messages = [
    {
      role: "system",
      content:
        "You are WeatherGPT, an assistant for weather, agriculture, farming, and disaster preparedness. " +
        "Answer clearly and conversationally using the live weather context and official alerts below. " +
        "Help farmers with practical crop, irrigation, soil, livestock, pest, harvest, and weather-risk ideas, " +
        "but do not invent local government schemes, pesticide doses, or disease diagnoses. " +
        "Do not claim information that is not in the context. For disaster alerts, identify the official source " +
        "and advise the user to follow local authorities. Keep answers concise unless the user asks for detail. " +
        `Live weather context: ${weatherContext(snapshot)}`,
    },
    ...history.map(({ role, content }) => ({ role, content })),
    { role: "user", content: message },
  ];

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
      messages,
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!groqResponse.ok) {
    const details = await groqResponse.text();
    console.error("Groq request failed:", groqResponse.status, details);
    const error = new Error("The weather assistant could not answer right now.");
    error.status = 502;
    throw error;
  }

  const data = await groqResponse.json();
  const answer = data.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim()) {
    const error = new Error("The weather assistant returned an empty answer.");
    error.status = 502;
    throw error;
  }
  return answer.trim();
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/api/alerts") {
      const latitude = Number(url.searchParams.get("lat"));
      const longitude = Number(url.searchParams.get("lon"));
      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return sendJson(response, 400, { error: "A valid latitude and longitude are required." });
      }
      return sendJson(response, 200, { alerts: await fetchOfficialAlerts(latitude, longitude) });
    }

    if (request.method === "GET" && url.pathname === "/api/chat") {
      const messages = getSession(request, response);
      return sendJson(response, 200, {
        messages: messages.map(({ id, role, content }) => ({ id, role, text: content })),
      });
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      const messages = getSession(request, response);
      const body = await readJson(request);
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message || message.length > 2000) {
        return sendJson(response, 400, { error: "Message must be between 1 and 2000 characters." });
      }

      const previous = messages.slice(-12).map(({ role, content }) => ({ role, content }));
      const answer = await answerWithGroq(previous, message, body.weather);
      messages.push({ id: randomUUID(), role: "user", content: message });
      messages.push({ id: randomUUID(), role: "assistant", content: answer });
      if (messages.length > MAX_MESSAGES) messages.splice(0, messages.length - MAX_MESSAGES);

      return sendJson(response, 200, { response: answer });
    }

    sendJson(response, 404, { error: "Not found." });
  } catch (error) {
    console.error("API error:", error);
    sendJson(response, error.status ?? 500, {
      error: error instanceof SyntaxError ? "Invalid JSON." : error.message,
    });
  }
});

server.listen(port, () => {
  console.log(`WeatherGPT server listening on http://localhost:${port}`);
});
