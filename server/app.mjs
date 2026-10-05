import express from "express";
import {
  answerWithGroq,
  fetchOfficialAlerts,
  getSession,
  recordMessage,
} from "../api/_lib.mjs";

const app = express();

app.use(express.json({ limit: "100kb" }));

function validateCoordinates(req, res) {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    res.status(400).json({ error: "A valid latitude and longitude are required." });
    return null;
  }
  return { latitude, longitude };
}

async function chatHandler(req, res) {
  try {
    const session = getSession(req, res);
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message || message.length > 2000) {
      return res.status(400).json({ error: "Message must be between 1 and 2000 characters." });
    }

    const previous = session.slice(-12).map(({ role, content }) => ({ role, content }));
    const answer = await answerWithGroq(previous, message, req.body.weather);
    recordMessage(session, "user", message);
    recordMessage(session, "assistant", answer);
    return res.json({ response: answer });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(error.status ?? 500).json({
      error: error instanceof SyntaxError ? "Invalid JSON." : error.message,
    });
  }
}

async function alertsHandler(req, res) {
  try {
    const coordinates = validateCoordinates(req, res);
    if (!coordinates) return;
    return res.json({
      alerts: await fetchOfficialAlerts(coordinates.latitude, coordinates.longitude),
    });
  } catch (error) {
    console.error("Alerts API error:", error);
    return res.status(502).json({ error: "Official alert data is temporarily unavailable." });
  }
}

app.post(["/api/chat", "/chat"], chatHandler);
app.get(["/api/alerts", "/alerts"], alertsHandler);

export default app;
