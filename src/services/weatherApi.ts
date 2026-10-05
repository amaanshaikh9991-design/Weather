import type {
  AirQuality,
  CurrentWeather,
  DailyForecastDay,
  HourlyPoint,
  LocationInfo,
} from "../types/weather";

export const DEFAULT_LOCATION = {
  latitude: 0,
  longitude: 0,
  city: "Location unavailable",
  region: "",
  country: "",
};


export interface WeatherCodeInfo {
  label: string;
  icon:
  | "clear-day"
  | "clear-night"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm";
}

const WEATHER_CODE_MAP: Record<number, WeatherCodeInfo> = {
  0: { label: "Clear Sky", icon: "clear-day" },
  1: { label: "Mainly Clear", icon: "clear-day" },
  2: { label: "Partly Cloudy", icon: "partly-cloudy" },
  3: { label: "Overcast", icon: "cloudy" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Rime Fog", icon: "fog" },
  51: { label: "Light Drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Dense Drizzle", icon: "drizzle" },
  56: { label: "Freezing Drizzle", icon: "drizzle" },
  57: { label: "Freezing Drizzle", icon: "drizzle" },
  61: { label: "Light Rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy Rain", icon: "rain" },
  66: { label: "Freezing Rain", icon: "rain" },
  67: { label: "Freezing Rain", icon: "rain" },
  71: { label: "Light Snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy Snow", icon: "snow" },
  77: { label: "Snow Grains", icon: "snow" },
  80: { label: "Light Showers", icon: "rain" },
  81: { label: "Showers", icon: "rain" },
  82: { label: "Violent Showers", icon: "rain" },
  85: { label: "Snow Showers", icon: "snow" },
  86: { label: "Heavy Snow Showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "thunderstorm" },
  96: { label: "Thunderstorm w/ Hail", icon: "thunderstorm" },
  99: { label: "Severe Thunderstorm", icon: "thunderstorm" },
};

export function describeWeatherCode(code: number, isDay = true): WeatherCodeInfo {
  const info = WEATHER_CODE_MAP[code] ?? { label: "Unknown", icon: "cloudy" };
  if (info.icon === "clear-day" && !isDay) {
    return { ...info, icon: "clear-night" };
  }
  return info;
}

interface ForecastResult {
  current: CurrentWeather;
  daily: DailyForecastDay[];
  hourly: HourlyPoint[];
  timezone: string;
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastResult> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "is_day",
    ].join(",")
  );
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "weather_code",
      "precipitation_probability",
      "relative_humidity_2m",
      "uv_index",
      "precipitation",
    ].join(",")
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",          
      "relative_humidity_2m_mean",  
      "wind_speed_10m_max",
      "uv_index_max",
      "sunrise",
      "sunset",
    ].join(",")
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "8");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch weather data");
  const data = await res.json();

  const current: CurrentWeather = {
    time: data.current.time,
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    precipitation: data.current.precipitation,
    weatherCode: data.current.weather_code,
    pressure: data.current.surface_pressure,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    windGusts: data.current.wind_gusts_10m,
    isDay: data.current.is_day === 1,
    uvIndex: Array.isArray(data.hourly?.uv_index) ? currentHourValue(data) : 0,
  };

  const daily: DailyForecastDay[] = (data.daily?.time ?? []).map(
  (date: string, i: number) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitationProbability: data.daily.precipitation_probability_max[i],
    precipitation: data.daily.precipitation_sum[i],      
    humidity: data.daily.relative_humidity_2m_mean[i],   
    windSpeedMax: data.daily.wind_speed_10m_max[i],
    uvIndexMax: data.daily.uv_index_max[i],
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
  })
);

  const nowIndex = findClosestHourIndex(data.hourly?.time ?? [], data.current.time);
  const hourly: HourlyPoint[] = (data.hourly?.time ?? [])
    .slice(nowIndex, nowIndex + 24)
    .map((time: string, idx: number) => ({
      time,
      temperature: data.hourly.temperature_2m[nowIndex + idx],
      weatherCode: data.hourly.weather_code[nowIndex + idx],
      precipitationProbability: data.hourly.precipitation_probability[nowIndex + idx],
      humidity: data.hourly.relative_humidity_2m[nowIndex + idx],
      uvIndex: data.hourly.uv_index[nowIndex + idx],
      precipitation: data.hourly.precipitation[nowIndex + idx],
    }));

  return { current, daily, hourly, timezone: data.timezone };
}

function findClosestHourIndex(times: string[], current: string): number {
  const currentDate = new Date(current);
  let idx = 0;
  let bestDiff = Infinity;
  times.forEach((t, i) => {
    const diff = Math.abs(new Date(t).getTime() - currentDate.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      idx = i;
    }
  });
  return idx;
}

function currentHourValue(data: any): number {
  const idx = findClosestHourIndex(data.hourly?.time ?? [], data.current.time);
  return data.hourly?.uv_index?.[idx] ?? 0;
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQuality> {
  try {
    const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("current", "us_aqi,pm2_5,pm10");
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("aqi failed");
    const data = await res.json();
    return {
      usAqi: data.current?.us_aqi ?? null,
      pm2_5: data.current?.pm2_5 ?? null,
      pm10: data.current?.pm10 ?? null,
    };
  } catch {
    return { usAqi: null, pm2_5: null, pm10: null };
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  try {
    const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("localityLanguage", "en");
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("reverse geocode failed");
    const data = await res.json();
    return {
      latitude: lat,
      longitude: lon,
      city: data.city || data.locality || data.principalSubdivision || "Unknown",
      region: data.principalSubdivision || "",
      country: data.countryName || "",
      timezone: "",
    };
  } catch {
    return {
      latitude: lat,
      longitude: lon,
      city: "Your Location",
      region: "",
      country: "",
      timezone: "",
    };
  }
}

export function getCurrentPosition(
  options: PositionOptions = { timeout: 8000, maximumAge: 300000 }
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}
