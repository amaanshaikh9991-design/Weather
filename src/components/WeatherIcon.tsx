import {
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  Cloud,
  Cloudy,
  Sun,
  Moon,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import { describeWeatherCode } from "../services/weatherApi";

interface Props extends LucideProps {
  code: number;
  isDay?: boolean;
}

export default function WeatherIcon({ code, isDay = true, ...props }: Props) {
  const { icon } = describeWeatherCode(code, isDay);
  switch (icon) {
    case "clear-day":
      return <Sun {...props} />;
    case "clear-night":
      return <Moon {...props} />;
    case "partly-cloudy":
      return <Cloud {...props} />;
    case "cloudy":
      return <Cloudy {...props} />;
    case "fog":
      return <CloudFog {...props} />;
    case "drizzle":
      return <CloudDrizzle {...props} />;
    case "rain":
      return <CloudRain {...props} />;
    case "snow":
      return <CloudSnow {...props} />;
    case "thunderstorm":
      return <CloudLightning {...props} />;
    default:
      return <Cloud {...props} />;
  }
}
