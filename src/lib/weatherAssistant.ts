import type { AirQuality, CurrentWeather, DailyForecastDay, LocationInfo } from "../types/weather";
import { describeWeatherCode } from "../services/weatherApi";

interface AssistantContext {
  location: LocationInfo | null;
  current: CurrentWeather | null;
  daily: DailyForecastDay[];
  airQuality: AirQuality | null;
}

function fmtDay(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export function generateWeatherReply(question: string, ctx: AssistantContext): string {
  const q = question.toLowerCase();
  const { location, current, daily, airQuality } = ctx;

  if (!current) {
    return "I'm still fetching live weather data. Give me just a moment and ask again.";
  }

  const place = location ? `${location.city}${location.region ? ", " + location.region : ""}` : "your location";
  const cond = describeWeatherCode(current.weatherCode, current.isDay).label;

  if (/humidity/.test(q)) {
    return `The current humidity in ${place} is ${Math.round(current.humidity)}%.`;
  }
  if (/wind/.test(q)) {
    return `Wind is blowing at ${Math.round(current.windSpeed)} km/h with gusts up to ${Math.round(
      current.windGusts
    )} km/h in ${place}.`;
  }
  if (/pressure/.test(q)) {
    return `The surface pressure in ${place} is ${Math.round(current.pressure)} hPa.`;
  }
  if (/uv/.test(q)) {
    return `The current UV index in ${place} is ${current.uvIndex.toFixed(1)}. ${
      current.uvIndex >= 6 ? "Consider wearing sunscreen." : "Low to moderate exposure risk."
    }`;
  }
  if (/air quality|aqi|pollution/.test(q)) {
    if (airQuality?.usAqi == null) return "Air quality data isn't available right now.";
    return `The US AQI in ${place} is ${Math.round(airQuality.usAqi)} (PM2.5: ${airQuality.pm2_5?.toFixed(
      1
    )} µg/m³). ${airQuality.usAqi > 100 ? "This may affect sensitive groups." : "Air quality is acceptable."}`;
  }
  if (/feels like|apparent/.test(q)) {
    return `It feels like ${Math.round(current.apparentTemperature)}°C in ${place}, while the actual temperature is ${Math.round(
      current.temperature
    )}°C.`;
  }
  if (/rain|precipitation|umbrella/.test(q)) {
    const today = daily[0];
    const chance = today?.precipitationProbability ?? 0;
    return `There's a ${chance}% chance of precipitation today in ${place}. ${
      chance > 50 ? "Carrying an umbrella is a good idea." : "You probably won't need an umbrella."
    }`;
  }
  if (/tomorrow/.test(q)) {
    const tmrw = daily[1];
    if (!tmrw) return "I don't have tomorrow's forecast yet.";
    const info = describeWeatherCode(tmrw.weatherCode, true).label;
    return `Tomorrow (${fmtDay(tmrw.date)}) in ${place}: ${info}, with a high of ${Math.round(
      tmrw.tempMax
    )}°C and a low of ${Math.round(tmrw.tempMin)}°C.`;
  }
  if (/week|forecast|next 7|days/.test(q)) {
    const summary = daily
      .slice(0, 5)
      .map((d) => `${fmtDay(d.date)}: ${Math.round(d.tempMax)}°/${Math.round(d.tempMin)}°C`)
      .join(", ");
    return `Here's the outlook for ${place}: ${summary}.`;
  }
  if (/temperature|hot|cold|degree/.test(q)) {
    return `Right now it's ${Math.round(current.temperature)}°C and ${cond.toLowerCase()} in ${place}, feels like ${Math.round(
      current.apparentTemperature
    )}°C.`;
  }
  if (/hello|hi\b|hey/.test(q)) {
    return `Hello! I'm your weather assistant. Currently in ${place} it's ${Math.round(
      current.temperature
    )}°C and ${cond.toLowerCase()}. Ask me about humidity, wind, pressure, UV, or the forecast.`;
  }
  if (/who are you|what can you do|help/.test(q)) {
    return "I'm WeatherGPT — ask me about current conditions, humidity, wind, pressure, UV index, air quality, or the multi-day forecast for your location.";
  }

  return `Currently in ${place}: ${cond}, ${Math.round(current.temperature)}°C (feels like ${Math.round(
    current.apparentTemperature
  )}°C), humidity ${Math.round(current.humidity)}%, wind ${Math.round(
    current.windSpeed
  )} km/h, pressure ${Math.round(current.pressure)} hPa. Ask me something more specific like "will it rain today?"`;
}
