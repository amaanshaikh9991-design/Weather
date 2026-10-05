import type { AirQuality, CurrentWeather, DailyForecastDay, LocationInfo } from "../types/weather";
import type { DisasterAlert } from "../types/disaster";

interface ChatWeatherContext {
  location: LocationInfo | null;
  current: CurrentWeather | null;
  daily: DailyForecastDay[];
  airQuality: AirQuality | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export async function loadChatHistory(): Promise<ChatMessage[]> {
  const response = await fetch("/api/chat");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Unable to load chat history.");
  return data.messages;
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
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Unable to contact the weather assistant.");
  return data.response;
}
