import { randomUUID } from "node:crypto";

const sessions = new Map();
const COOKIE_NAME = "weather_session";
const MAX_MESSAGES = 40;

export function sendJson(response, status, body, headers = {}) {
  response.statusCode = status;

  response.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  for (const [key, value] of Object.entries(headers)) {
    response.setHeader(key, value);
  }

  return response.end(JSON.stringify(body));
}

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)])
  );
}

export function getSession(request, response) {
  const cookies = parseCookies(request.headers.cookie);
  let sessionId = cookies[COOKIE_NAME];

  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = randomUUID();
    sessions.set(sessionId, []);
    response.setHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`
    );
  }

  return sessions.get(sessionId);
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

function xmlValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return match
    ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim()
    : "";
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function fetchOfficialAlerts(latitude, longitude) {
  const alerts = [];

  if (latitude >= 24.396 && latitude <= 49.384 && longitude >= -125 && longitude <= -66.5) {
    try {
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
      }
    } catch (error) {
      console.warn("NWS alerts feed unavailable:", error);
    }
  }

  try {
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
  } catch (error) {
    console.warn("GDACS alerts feed unavailable:", error);
  }

  return alerts.slice(0, 20);
}

function weatherContext(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return "Live weather context is unavailable.";
  return JSON.stringify(snapshot);
}

export async function answerWithGroq(history, message, snapshot) {
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
    console.error("Groq request failed:", groqResponse.status, await groqResponse.text());
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

export function recordMessage(session, role, content) {
  session.push({ id: randomUUID(), role, content });
  if (session.length > MAX_MESSAGES) session.splice(0, session.length - MAX_MESSAGES);
}
