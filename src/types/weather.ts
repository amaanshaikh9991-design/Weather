export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  isDay: boolean;
  uvIndex: number;
}

export interface DailyForecastDay {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  precipitation: number;   
  humidity: number;        
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyPoint {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
  humidity: number;
  uvIndex: number;
  precipitation: number;
}

export interface AirQuality {
  usAqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
}

export interface WeatherAlert {
  id: string;
  severity: "warning" | "watch" | "advisory";
  title: string;
  description: string;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  timezone: string;
}

export interface WeatherState {
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
}
