import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type {
  AirQuality,
  CurrentWeather,
  DailyForecastDay,
  HourlyPoint,
  LocationInfo,
} from "../types/weather";
import {
  DEFAULT_LOCATION,
  fetchAirQuality,
  fetchForecast,
  getCurrentPosition,
  reverseGeocode,
} from "../services/weatherApi";

interface WeatherContextValue {
  loading: boolean;
  error: string | null;
  location: LocationInfo | null;
  current: CurrentWeather | null;
  daily: DailyForecastDay[];
  hourly: HourlyPoint[];
  airQuality: AirQuality | null;
  lastUpdated: Date | null;
  refresh: () => void;
  useMyLocation: () => void;
  selectLocation: (lat: number, lon: number) => void;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

const REFRESH_INTERVAL = 10 * 60 * 1000;

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [daily, setDaily] = useState<DailyForecastDay[]>([]);
  const [hourly, setHourly] = useState<HourlyPoint[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const coordsRef = useRef({ lat: DEFAULT_LOCATION.latitude, lon: DEFAULT_LOCATION.longitude });

  const loadFor = useCallback(async (lat: number, lon: number, withGeocode: boolean) => {
    setLoading(true);
    setError(null);
    coordsRef.current = { lat, lon };
    try {
      const [forecast, aqi, loc] = await Promise.all([
        fetchForecast(lat, lon),
        fetchAirQuality(lat, lon),
        withGeocode
          ? reverseGeocode(lat, lon)
          : Promise.resolve({
              latitude: lat,
              longitude: lon,
              city: "Selected Location",
              region: "",
              country: "",
              timezone: "",
            } as LocationInfo),
      ]);
      setCurrent(forecast.current);
      setDaily(forecast.daily);
      setHourly(forecast.hourly);
      setAirQuality(aqi);
      setLocation({ ...loc, timezone: forecast.timezone });
      setLastUpdated(new Date());
    } catch (e) {
      setError("Unable to fetch live weather data right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  const init = useCallback(async () => {
    const saved = localStorage.getItem("weathergpt_location");
    if (saved) {
      try {
        const coordinates = JSON.parse(saved) as { lat: number; lon: number };
        if (Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lon)) {
          await loadFor(coordinates.lat, coordinates.lon, true);
          return;
        }
      } catch {
        localStorage.removeItem("weathergpt_location");
      }
    }
    try {
      const pos = await getCurrentPosition();
      localStorage.setItem(
        "weathergpt_location",
        JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      );
      await loadFor(pos.coords.latitude, pos.coords.longitude, true);
    } catch {
      setError("Location permission is needed for live weather. Use the location button to try again.");
      setLoading(false);
    }
  }, [loadFor]);

  const useMyLocation = useCallback(() => {
    init();
  }, [init]);

  const selectLocation = useCallback((lat: number, lon: number) => {
    localStorage.setItem("weathergpt_location", JSON.stringify({ lat, lon }));
    loadFor(lat, lon, true);
  }, [loadFor]);

  const refresh = useCallback(() => {
    loadFor(coordsRef.current.lat, coordsRef.current.lon, false);
  }, [loadFor]);

  useEffect(() => {
    init();
    const id = setInterval(() => {
      loadFor(coordsRef.current.lat, coordsRef.current.lon, false);
    }, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [init, loadFor]);

  return (
    <WeatherContext.Provider
      value={{
        loading,
        error,
        location,
        current,
        daily,
        hourly,
        airQuality,
        lastUpdated,
        refresh,
        useMyLocation,
        selectLocation,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be used within WeatherProvider");
  return ctx;
}
