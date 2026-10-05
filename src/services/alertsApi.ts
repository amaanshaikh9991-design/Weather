import type { DisasterAlert } from "../types/disaster";

export async function fetchOfficialAlerts(latitude: number, longitude: number): Promise<DisasterAlert[]> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });
  const response = await fetch(`/api/alerts?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Unable to load official alerts.");
  return data.alerts;
}
