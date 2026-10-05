import type { AirQuality, CurrentWeather, DailyForecastDay } from "../types/weather";
import type { WeatherAlert } from "../types/weather";

interface AlertCtx {
  current: CurrentWeather | null;
  daily: DailyForecastDay[];
  airQuality: AirQuality | null;
}

export function getActiveAlerts({ current, daily, airQuality }: AlertCtx): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  if (!current) return alerts;

  if ([95, 96, 99].includes(current.weatherCode)) {
    alerts.push({
      id: "thunderstorm",
      severity: "warning",
      title: "Thunderstorm Warning",
      description: "Active thunderstorm activity detected in your area. Seek shelter and avoid open fields.",
    });
  }

  if (current.windGusts >= 60) {
    alerts.push({
      id: "high-wind",
      severity: "warning",
      title: "High Wind Warning",
      description: `Wind gusts reaching ${Math.round(current.windGusts)} km/h. Secure loose outdoor objects.`,
    });
  } else if (current.windGusts >= 40) {
    alerts.push({
      id: "wind-watch",
      severity: "watch",
      title: "Wind Watch",
      description: `Gusty winds up to ${Math.round(current.windGusts)} km/h expected. Drive with caution.`,
    });
  }

  if (current.temperature >= 42) {
    alerts.push({
      id: "extreme-heat",
      severity: "warning",
      title: "Extreme Heat Warning",
      description: `Temperature at ${Math.round(current.temperature)}°C. Risk of heat stroke — stay hydrated and avoid direct sun.`,
    });
  } else if (current.temperature >= 38) {
    alerts.push({
      id: "heat-advisory",
      severity: "advisory",
      title: "Heat Advisory",
      description: `Temperature at ${Math.round(current.temperature)}°C. Limit prolonged outdoor exposure.`,
    });
  }

  if (current.temperature <= 2) {
    alerts.push({
      id: "cold-advisory",
      severity: "advisory",
      title: "Cold Weather Advisory",
      description: `Temperature near ${Math.round(current.temperature)}°C. Dress in warm layers.`,
    });
  }

  if (current.uvIndex >= 8) {
    alerts.push({
      id: "uv-high",
      severity: "watch",
      title: "Very High UV Index",
      description: `UV index at ${current.uvIndex.toFixed(1)}. Use SPF 30+ sunscreen and sunglasses.`,
    });
  }

  const rainChance = daily[0]?.precipitationProbability ?? 0;
  if (rainChance >= 75) {
    alerts.push({
      id: "heavy-rain",
      severity: "watch",
      title: "Heavy Rain Watch",
      description: `${rainChance}% chance of precipitation today. Possible localized flooding.`,
    });
  }

  if (airQuality?.usAqi && airQuality.usAqi > 150) {
    alerts.push({
      id: "air-quality",
      severity: "warning",
      title: "Unhealthy Air Quality",
      description: `US AQI at ${Math.round(airQuality.usAqi)}. Sensitive groups should limit outdoor activity.`,
    });
  } else if (airQuality?.usAqi && airQuality.usAqi > 100) {
    alerts.push({
      id: "air-quality-moderate",
      severity: "advisory",
      title: "Moderate Air Quality",
      description: `US AQI at ${Math.round(airQuality.usAqi)}. Unusually sensitive people should consider reducing exertion.`,
    });
  }

  return alerts;
}
