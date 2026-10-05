import type { AirQuality, CurrentWeather, DailyForecastDay, LocationInfo } from "../types/weather";
import type { DisasterAlert } from "../types/disaster";

interface ChatWeatherContext {
  location: LocationInfo | null;
  current: CurrentWeather | null;
  daily: DailyForecastDay[];
  airQuality: AirQuality | null;
}

export async function sendChatMessage(
  message: string,
  weather: ChatWeatherContext,
  officialAlerts: DisasterAlert[] = []
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, weather: { ...weather, officialAlerts } }),
  });
  const data = await readApiResponse(response);
  if (!response.ok) throw new Error(data.error ?? "Unable to contact the weather assistant.");
  if (typeof data.response !== "string") throw new Error("The weather assistant returned an invalid response.");
  return data.response;
}

async function readApiResponse(response: Response): Promise<{ error?: string; response?: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      response.status === 404
        ? "The chat service is not deployed at /api/chat."
        : `The chat service returned an unexpected response (HTTP ${response.status}).`
    );
  }

  try {
    return JSON.parse(body) as { error?: string; response?: string };
  } catch {
    throw new Error("The chat service returned invalid JSON.");
  }
}
