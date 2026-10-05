import { useWeather } from "../context/WeatherContext";
import { DEFAULT_LOCATION } from "../services/weatherApi";
interface AnalysisMapProps {
    layer: string;
}

export default function AnalysisMap({ layer }: AnalysisMapProps) {
    const { location } = useWeather();

    const lat = location?.latitude ?? DEFAULT_LOCATION.latitude;
    const lon = location?.longitude ?? DEFAULT_LOCATION.longitude;

    // Default Windy layer
    const overlayMap: Record<string, string> = {
        temperature: "temp",
        rainfall: "rain",
        humidity: "rh",
        uv: "temp",
    };

    const overlay = overlayMap[layer] || "wind";

    const src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&zoom=7&level=surface&overlay=${overlay}&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

    return (
        <iframe
            key={src}
            title="Analysis Weather Map"
            src={src}
            className="h-full w-full border-0 rounded-2xl"
            loading="lazy"
        />
    );
}