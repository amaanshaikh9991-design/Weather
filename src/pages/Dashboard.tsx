import { motion, type Variants } from "framer-motion";
import {
  Droplets,
  Wind,
  Gauge,
  Sun,
  Sunrise,
  Sunset,
  Wind as WindIcon,
  Thermometer,
  Sparkles,
} from "lucide-react";

import { useWeather } from "../context/WeatherContext";
import WeatherIcon from "../components/WeatherIcon";
import WeatherBackground from "../components/WeatherBackground";
import { describeWeatherCode } from "../services/weatherApi";

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    y: 12,
    opacity: 0,
  },

  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

function windDirectionLabel(deg: number) {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];

  return dirs[Math.round(deg / 22.5) % 16];
}

function aqiColor(aqi: number) {
  if (aqi > 150) return "#ef4444";
  if (aqi > 100) return "#f59e0b";
  if (aqi > 50) return "#facc15";
  return "#22c55e";
}

function aqiLabel(aqi: number) {
  if (aqi > 150) return "Unhealthy";
  if (aqi > 100) return "Sensitive groups";
  if (aqi > 50) return "Moderate";
  return "Good";
}

function AqiGauge({ aqi }: { aqi: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, (aqi / 300) * 100);
  const offset = circumference - (pct / 100) * circumference;
  const color = aqiColor(aqi);

  return (
    <div className="flex items-center gap-5">
      <svg
        width="112"
        height="112"
        viewBox="0 0 112 112"
        className="-rotate-90"
      >
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />

        <motion.circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: circumference,
          }}
          animate={{
            strokeDashoffset: offset,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: "easeOut",
          }}
        />
      </svg>

      <div className="flex flex-col">
        <span className="text-4xl font-bold text-white tabular-nums">
          {Math.round(aqi)}
        </span>

        <span className="text-xs font-medium text-slate-400">
          US AQI
        </span>

        <span
          className="mt-2 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            color,
            backgroundColor: `${color}1a`,
          }}
        >
          {aqiLabel(aqi)}
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    loading,
    error,
    location,
    current,
    daily,
    hourly,
    airQuality,
  } = useWeather();

  if (loading && !current) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  if (!current) {
    return null;
  }

  const info = describeWeatherCode(
    current.weatherCode,
    current.isDay
  );

  const today = daily[0];

  const insights = [
    current.temperature >= 35
      ? "Heat is elevated. Plan outdoor work for early morning or evening and keep people and livestock hydrated."
      : current.temperature <= 10
        ? "Cool conditions may slow crop growth. Protect sensitive plants and check livestock shelter."
        : "Temperatures are comfortable for most outdoor work; use the forecast to plan field activities.",
    (today?.precipitationProbability ?? 0) >= 60
      ? "Rain is likely today. Delay spraying, clear drainage channels, and avoid unnecessary field travel."
      : current.humidity >= 80
        ? "High humidity can increase fungal pressure. Inspect leaves and improve airflow before treating crops."
        : "Dry conditions are expected. Check soil moisture before irrigating instead of watering on a fixed schedule.",
    current.windGusts >= 40
      ? "Strong gusts are possible. Secure nursery covers, shade nets, tools, and loose farm equipment."
      : `Current wind is suitable for routine work, but avoid spraying when wind increases or changes direction.`,
  ];

  const stats = [
    {
      label: "Humidity",
      value: `${Math.round(current.humidity)}%`,
      icon: Droplets,
      color: "text-cyan-400",
    },
    {
      label: "Wind Speed",
      value: `${Math.round(current.windSpeed)} km/h`,
      icon: Wind,
      color: "text-sky-400",
    },
    {
      label: "Pressure",
      value: `${Math.round(current.pressure)} hPa`,
      icon: Gauge,
      color: "text-indigo-400",
    },
    {
      label: "UV Index",
      value: current.uvIndex.toFixed(1),
      icon: Sun,
      color: "text-amber-400",
    },
  ];

  return (
    <motion.div
      className="dashboard-shell wx-scroll h-full overflow-y-auto p-4 md:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =====================================================
          TOP GRID
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* MAIN WEATHER CARD */}

        <motion.div
          variants={itemVariants}
          className="xl:col-span-2"
        >
          <div className="dashboard-hero wx-panel-hero wx-card-hover relative flex min-h-[280px] h-full flex-col justify-between overflow-hidden p-8">

            <WeatherBackground
              code={current.weatherCode}
              isDay={current.isDay}
            />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                  {location
                    ? `${location.city}, ${location.region || ""}`
                    : "Locating..."}
                </p>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-7xl font-bold tracking-tighter text-white">
                    {Math.round(current.temperature)}°
                  </span>

                  <span className="text-xl font-medium text-slate-400">
                    C
                  </span>
                </div>

                <p className="mt-2 text-xl font-semibold text-slate-200">
                  {info.label}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Feels like{" "}
                  {Math.round(current.apparentTemperature)}° · H:
                  {Math.round(today?.tempMax ?? 0)}° L:
                  {Math.round(today?.tempMin ?? 0)}°
                </p>
              </div>

              <motion.div
                className="wx-icon-float"
                initial={{
                  scale: 0.9,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.15,
                }}
              >
                <WeatherIcon
                  code={current.weatherCode}
                  isDay={current.isDay}
                  className="h-32 w-32 text-blue-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                  strokeWidth={1.2}
                />
              </motion.div>
            </div>

            {/* STATS */}

            <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => {
                const Icon = s.icon;

                return (
                  <div
                    key={s.label}
                    className="dashboard-stat flex flex-col gap-1 rounded-xl bg-white/5 p-3"
                  >
                    <Icon
                      className={`h-5 w-5 ${s.color}`}
                    />

                    <span className="text-lg font-bold text-white">
                      {s.value}
                    </span>

                    <span className="text-xs font-medium text-slate-400">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* SUN & WIND */}

        <motion.div
          variants={itemVariants}
          className="wx-panel wx-card-hover flex flex-col justify-center p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-300">
            <Sun className="h-4 w-4 text-amber-400" />
            Sun & Wind
          </h3>

          <div className="space-y-6">
            <StatRow
              icon={Sunrise}
              label="Sunrise"
              value={
                today
                  ? new Date(today.sunrise).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "--"
              }
              color="text-amber-400"
            />

            <StatRow
              icon={Sunset}
              label="Sunset"
              value={
                today
                  ? new Date(today.sunset).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "--"
              }
              color="text-orange-400"
            />

            <div className="h-px bg-white/10" />

            <StatRow
              icon={WindIcon}
              label="Direction"
              value={`${windDirectionLabel(
                current.windDirection
              )} (${Math.round(current.windDirection)}°)`}
              color="text-sky-400"
            />

            <StatRow
              icon={Thermometer}
              label="Gusts"
              value={`${Math.round(current.windGusts)} km/h`}
              color="text-slate-400"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="wx-panel wx-card-hover mt-6 overflow-hidden border-cyan-400/25 bg-gradient-to-br from-cyan-400/[0.10] via-slate-900/60 to-slate-900/80 p-6 shadow-[0_12px_40px_rgba(34,211,238,0.08)]"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-cyan-400/10 p-2.5">
            <Sparkles className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-wide text-slate-100">
              AI weather insights
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Live recommendations based on the current weather in {location?.city ?? "your area"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {insights.map((insight, index) => (
            <div key={insight} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Insight {index + 1}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{insight}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-slate-500">
          General guidance only. Confirm crop-specific actions with a local agricultural officer.
        </p>
      </motion.div>

      {/* =====================================================
          MIDDLE GRID
      ====================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* AIR QUALITY */}

        <motion.div
          variants={itemVariants}
          className="wx-panel wx-card-hover p-6 lg:col-span-1"
        >
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-300">
            Air Quality
          </h3>

          {airQuality?.usAqi != null ? (
            <div className="flex flex-col gap-4">
              <AqiGauge aqi={airQuality.usAqi} />

              <p className="text-xs leading-relaxed text-slate-400">
                PM2.5: {airQuality.pm2_5?.toFixed(1)} · PM10:{" "}
                {airQuality.pm10?.toFixed(1)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Data unavailable
            </p>
          )}
        </motion.div>

        {/* HOURLY FORECAST */}

        <motion.div
          variants={itemVariants}
          className="wx-panel wx-card-hover overflow-hidden p-6 lg:col-span-2"
        >
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-300">
            Next 24 Hours
          </h3>

          <div className="wx-scroll flex gap-4 overflow-x-auto pb-4 pt-2">
            {hourly.slice(0, 12).map((h) => (
              <div
                key={h.time}
                className="flex w-20 flex-shrink-0 flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
              >
                <span className="text-xs font-semibold text-slate-400">
                  {new Date(h.time).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                    }
                  )}
                </span>

                <WeatherIcon
                  code={h.weatherCode}
                  className="h-8 w-8 text-blue-400"
                />

                <span className="text-lg font-bold text-white">
                  {Math.round(h.temperature)}°
                </span>

                <span className="rounded-full bg-cyan-900/30 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                  {h.precipitationProbability}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* =====================================================
          NEW 7-DAY FORECAST
      ====================================================== */}

      <motion.div
        variants={itemVariants}
        className="wx-panel wx-card-hover mt-6 overflow-hidden p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-300">
              7-Day Forecast
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Extended weather outlook
            </p>
          </div>

          <div className="rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold text-cyan-400">
            7 DAYS
          </div>
        </div>

        <div className="wx-scroll flex gap-3 overflow-x-auto pb-2">
          {daily.slice(0, 7).map((d, i) => {
            const dayName =
              i === 0
                ? "Today"
                : new Date(d.date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                    }
                  );

            const fullDate = new Date(d.date).toLocaleDateString(
              "en-US",
              {
                day: "numeric",
                month: "short",
              }
            );

            return (
              <div
                key={d.date}
                className={`group relative min-w-[145px] flex-1 overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                  i === 0
                    ? "border-cyan-400/30 bg-cyan-400/[0.08] shadow-[0_0_25px_rgba(56,189,248,0.08)]"
                    : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                {/* TOP */}

                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        i === 0
                          ? "text-cyan-400"
                          : "text-slate-200"
                      }`}
                    >
                      {dayName}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {fullDate}
                    </p>
                  </div>

                  {i === 0 && (
                    <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[9px] font-semibold text-cyan-400">
                      NOW
                    </span>
                  )}
                </div>

                {/* WEATHER ICON */}

                <div className="my-5 flex justify-center">
                  <WeatherIcon
                    code={d.weatherCode}
                    className="h-12 w-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.25)] transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* CONDITION */}

                <p className="mb-3 text-center text-xs font-medium text-slate-400">
                  {describeWeatherCode(d.weatherCode, true).label}
                </p>

                {/* TEMPERATURE */}

                <div className="flex items-end justify-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {Math.round(d.tempMax)}°
                  </span>

                  <span className="mb-0.5 text-sm font-medium text-slate-500">
                    {Math.round(d.tempMin)}°
                  </span>
                </div>

                {/* RAIN */}

                <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-white/10 pt-3">
                  <Droplets className="h-3.5 w-3.5 text-cyan-400" />

                  <span className="text-[10px] font-semibold text-cyan-400">
                    {d.precipitationProbability}% rain
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =====================================================
   STAT ROW
===================================================== */

function StatRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="group flex items-center justify-between">
      <span className="flex items-center gap-3 text-slate-400 transition-colors group-hover:text-slate-200">
        <div
          className={`rounded-lg bg-white/5 p-2 ${color}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <span className="text-sm font-medium">
          {label}
        </span>
      </span>

      <span className="tabular-nums font-bold text-white">
        {value}
      </span>
    </div>
  );
}