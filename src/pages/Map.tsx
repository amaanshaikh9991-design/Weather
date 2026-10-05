import { useState } from "react";
import { Wind, CloudRain, Thermometer, Cloud } from "lucide-react";
import { useWeather } from "../context/WeatherContext";
import { DEFAULT_LOCATION } from "../services/weatherApi";

const LAYERS = [
  { key: "wind", label: "Wind", icon: Wind },
  { key: "rain", label: "Rain", icon: CloudRain },
  { key: "temp", label: "Temperature", icon: Thermometer },
  { key: "clouds", label: "Clouds", icon: Cloud },
];

export default function Map() {
  const { location } = useWeather();
  const [overlay, setOverlay] = useState("wind");

  const lat = location?.latitude ?? DEFAULT_LOCATION.latitude;
  const lon = location?.longitude ?? DEFAULT_LOCATION.longitude;

  const src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&zoom=7&level=surface&overlay=${overlay}&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

  return (
    <div className="wx-fade-in flex h-full flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Weather Map</h2>
          <p className="text-sm text-[color:var(--wx-text-dim)]">
            {location ? `Centered on ${location.city}${location.region ? ", " + location.region : ""}` : "Locating..."}
          </p>
        </div>
        <div className="flex gap-2 rounded-2xl border border-[color:var(--wx-border)] bg-black/20 p-1.5">
          {LAYERS.map((l) => (
            <button
              key={l.key}
              onClick={() => setOverlay(l.key)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                overlay === l.key
                  ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/25"
                  : "text-[color:var(--wx-text-dim)] hover:text-white"
              }`}
            >
              <l.icon className="h-3.5 w-3.5" /> {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="wx-panel flex-1 overflow-hidden">
        <iframe
          key={src}
          title="Live Weather Map"
          src={src}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
