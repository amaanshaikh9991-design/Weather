import type { DisasterAlert } from "../types/disaster";

export async function fetchOfficialAlerts(latitude: number, longitude: number): Promise<DisasterAlert[]> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });
  const response = await fetch(`/api/alerts?${params.toString()}`);
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      response.ok
        ? "The official alert service returned an unexpected response."
        : `Official alert service is unavailable (HTTP ${response.status}).`
    );
  }

  let data: { alerts?: DisasterAlert[]; error?: string };
  try {
    data = JSON.parse(body) as { alerts?: DisasterAlert[]; error?: string };
  } catch {
    throw new Error("The official alert service returned invalid JSON.");
  }

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to load official alerts.");
  }

  if (!Array.isArray(data.alerts)) {
    throw new Error("The official alert service returned an invalid alert list.");
  }

  return data.alerts;
}
