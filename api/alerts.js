import { fetchOfficialAlerts, sendJson } from "./_lib.mjs";

export default async function handler(request, response) {
  try {
    if (request.method !== "GET") {
      return sendJson(response, 405, { error: "Method not allowed." });
    }

    const latitude = Number(request.query.lat);
    const longitude = Number(request.query.lon);
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

    return sendJson(response, 200, {
      alerts: await fetchOfficialAlerts(latitude, longitude),
    });
  } catch (error) {
    console.error("Alerts API error:", error);
    return sendJson(response, error.status ?? 502, {
      error: "Official alert data is temporarily unavailable.",
    });
  }
}
