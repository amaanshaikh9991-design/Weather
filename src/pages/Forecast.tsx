import { Droplets, Wind, Sun, Sunrise, Sunset, Gauge } from "lucide-react";
import { useWeather } from "../context/WeatherContext";
import WeatherIcon from "../components/WeatherIcon";
import { describeWeatherCode } from "../services/weatherApi";

function formatHour(time: string) {
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "numeric",
  });
}

function formatDay(date: string, index: number) {
  if (index === 0) return "Today";

  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

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

export default function Forecast() {
  const {
    current,
    daily,
    hourly,
    location,
    loading,
  } = useWeather();

  if (loading && !current) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  if (!current) return null;

  const today = daily[0];

  const forecastDays = daily.slice(0, 8);
  const forecastHours = hourly.slice(0, 12);

  const maxTemp = Math.max(
    ...forecastDays.map((d) => d.tempMax)
  );

  const minTemp = Math.min(
    ...forecastDays.map((d) => d.tempMin)
  );

  const tempRange = Math.max(1, maxTemp - minTemp);

  const currentInfo = describeWeatherCode(
    current.weatherCode,
    current.isDay
  );

  return (
    <div className="wx-fade-in wx-scroll h-full overflow-y-auto p-4 md:p-6 lg:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Forecast Intelligence
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            {location?.city ?? "Your Area"}
          </h1>

          <p className="mt-1 text-sm text-[color:var(--wx-text-dim)]">
            8-day atmospheric outlook and hourly conditions
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Live forecast
        </div>
      </div>

      {/* =====================================================
          CURRENT FORECAST HERO
      ===================================================== */}

      <div className="wx-panel-hero relative mb-6 overflow-hidden p-6 md:p-7">

        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">

          {/* Current weather */}

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current conditions
              </p>

              <div className="mt-3 flex items-center gap-4">

                <WeatherIcon
                  code={current.weatherCode}
                  isDay={current.isDay}
                  className="h-16 w-16 text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.35)]"
                  strokeWidth={1.4}
                />

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight text-white">
                      {Math.round(current.temperature)}°
                    </span>

                    <span className="text-lg text-slate-400">
                      C
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-300">
                    {currentInfo.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Feels like{" "}
                    {Math.round(current.apparentTemperature)}°
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Quick metrics */}

          <div className="grid grid-cols-2 gap-3">

            <ForecastMetric
              icon={Droplets}
              label="Rain"
              value={`${today?.precipitationProbability ?? 0}%`}
              iconClass="text-cyan-400"
            />

            <ForecastMetric
              icon={Wind}
              label="Wind"
              value={`${Math.round(current.windSpeed)} km/h`}
              iconClass="text-sky-400"
            />

            <ForecastMetric
              icon={Sun}
              label="UV Index"
              value={current.uvIndex.toFixed(1)}
              iconClass="text-amber-400"
            />

            <ForecastMetric
              icon={Gauge}
              label="Pressure"
              value={`${Math.round(current.pressure)}`}
              suffix="hPa"
              iconClass="text-indigo-400"
            />

          </div>
        </div>
      </div>

      {/* =====================================================
          NEXT 12 HOURS
      ===================================================== */}

      <section className="wx-panel mb-6 overflow-hidden p-5 md:p-6">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-200">
              Next 12 Hours
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Hour-by-hour atmospheric conditions
            </p>
          </div>

          <div className="hidden text-xs text-slate-500 sm:block">
            Temperature · Rain probability
          </div>

        </div>

        <div className="wx-scroll flex gap-3 overflow-x-auto pb-2">

          {forecastHours.map((h, index) => {

            const isCurrent = index === 0;

            return (
              <div
                key={h.time}
                className={`group relative min-w-[88px] flex-shrink-0 overflow-hidden rounded-2xl border p-4 text-center transition-all duration-200 ${
                  isCurrent
                    ? "border-sky-400/40 bg-sky-400/10"
                    : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >

                {isCurrent && (
                  <div className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 bg-sky-400" />
                )}

                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? "text-sky-400"
                      : "text-slate-400"
                  }`}
                >
                  {formatHour(h.time)}
                </p>

                <WeatherIcon
                  code={h.weatherCode}
                  isDay={true}
                  className="mx-auto my-3 h-8 w-8 text-sky-400"
                />

                <p className="text-lg font-bold text-white">
                  {Math.round(h.temperature)}°
                </p>

                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-cyan-400">
                  <Droplets className="h-3 w-3" />
                  {h.precipitationProbability}%
                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* =====================================================
          TODAY AT A GLANCE
      ===================================================== */}

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Day overview */}

        <div className="wx-panel p-6">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
              Today
            </p>

            <h2 className="mt-1 text-lg font-bold text-white">
              {currentInfo.label}
            </h2>
          </div>

          <div className="flex items-center justify-between">

            <div>
              <span className="text-5xl font-bold text-white">
                {Math.round(today?.tempMax ?? current.temperature)}°
              </span>

              <span className="ml-2 text-lg text-slate-500">
                / {Math.round(today?.tempMin ?? current.temperature)}°
              </span>

              <p className="mt-2 text-xs text-slate-400">
                High / Low
              </p>
            </div>

            <WeatherIcon
              code={today?.weatherCode ?? current.weatherCode}
              isDay={current.isDay}
              className="h-20 w-20 text-sky-400"
            />

          </div>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/5">

            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-amber-400"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    10,
                    ((current.temperature - (today?.tempMin ?? minTemp)) /
                      Math.max(
                        1,
                        (today?.tempMax ?? maxTemp) -
                          (today?.tempMin ?? minTemp)
                      )) *
                      100
                  )
                )}%`,
              }}
            />

          </div>

        </div>

        {/* Sun cycle */}

        <div className="wx-panel p-6">

          <h2 className="mb-5 text-sm font-bold uppercase tracking-wide text-slate-300">
            Daylight Cycle
          </h2>

          <div className="space-y-5">

            <SunRow
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
              className="text-amber-400"
            />

            <div className="h-px bg-white/10" />

            <SunRow
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
              className="text-orange-400"
            />

            <div className="flex items-center justify-between rounded-xl bg-white/[0.035] p-3">

              <span className="flex items-center gap-2 text-xs text-slate-400">
                <Wind className="h-4 w-4 text-sky-400" />
                Wind direction
              </span>

              <span className="text-sm font-bold text-white">
                {windDirectionLabel(current.windDirection)}
                {" "}
                {Math.round(current.windDirection)}°
              </span>

            </div>

          </div>
        </div>

      </section>

      {/* =====================================================
          8 DAY OUTLOOK
      ===================================================== */}

      <section className="wx-panel mb-6 overflow-hidden p-5 md:p-6">

        <div className="mb-5">

          <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
            Extended forecast
          </p>

          <h2 className="mt-1 text-lg font-bold text-white">
            8-Day Atmospheric Outlook
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Compare temperature, precipitation, wind and UV conditions
          </p>

        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

          {forecastDays.map((d, i) => {

            const info = describeWeatherCode(
              d.weatherCode,
              true
            );

            const leftPct =
              ((d.tempMin - minTemp) / tempRange) * 100;

            const widthPct =
              ((d.tempMax - d.tempMin) / tempRange) * 100;

            return (
              <div
                key={d.date}
                className={`group rounded-2xl border p-4 transition-all duration-200 ${
                  i === 0
                    ? "border-sky-400/30 bg-sky-400/[0.07]"
                    : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >

                <div className="flex items-start justify-between">

                  <div>
                    <p
                      className={`text-sm font-bold ${
                        i === 0
                          ? "text-sky-400"
                          : "text-white"
                      }`}
                    >
                      {formatDay(d.date, i)}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {new Date(d.date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <WeatherIcon
                    code={d.weatherCode}
                    className="h-9 w-9 text-sky-400"
                  />

                </div>

                <p className="mt-3 text-xs font-medium text-slate-400">
                  {info.label}
                </p>

                <div className="mt-4 flex items-baseline gap-2">

                  <span className="text-2xl font-bold text-white">
                    {Math.round(d.tempMax)}°
                  </span>

                  <span className="text-sm text-slate-500">
                    {Math.round(d.tempMin)}°
                  </span>

                </div>

                <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={{
                      left: `${Math.max(0, leftPct)}%`,
                      width: `${Math.max(8, widthPct)}%`,
                    }}
                  />

                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">

                  <MiniStat
                    icon={Droplets}
                    value={`${d.precipitationProbability}%`}
                    label="Rain"
                  />

                  <MiniStat
                    icon={Wind}
                    value={`${Math.round(d.windSpeedMax)}`}
                    label="km/h"
                  />

                  <MiniStat
                    icon={Sun}
                    value={d.uvIndexMax.toFixed(1)}
                    label="UV"
                  />

                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* =====================================================
          TEMPERATURE TREND
      ===================================================== */}

      <section className="wx-panel p-5 md:p-6">

        <div className="mb-6">

          <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
            Long-range trend
          </p>

          <h2 className="mt-1 text-lg font-bold text-white">
            Temperature Trend
          </h2>

        </div>

        <div className="relative">

          <div className="flex h-48 items-end gap-2 md:gap-4">

            {forecastDays.map((d, i) => {

              const highHeight =
                ((d.tempMax - minTemp) / tempRange) * 100;

              const lowHeight =
                ((d.tempMin - minTemp) / tempRange) * 100;

              return (
                <div
                  key={d.date}
                  className="flex h-full flex-1 flex-col justify-end"
                >

                  <div className="mb-2 text-center">

                    <span className="text-xs font-bold text-white">
                      {Math.round(d.tempMax)}°
                    </span>

                  </div>

                  <div className="relative mx-auto flex h-full w-full max-w-8 items-end justify-center">

                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-sky-500/30 to-amber-400/80 transition-all duration-500"
                      style={{
                        height: `${Math.max(
                          18,
                          highHeight
                        )}%`,
                      }}
                    >
                      <div
                        className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white"
                        style={{
                          bottom: `${Math.max(
                            18,
                            lowHeight
                          )}%`,
                        }}
                      />
                    </div>

                  </div>

                  <div className="mt-3 text-center">

                    <p className="text-[11px] font-semibold text-slate-300">
                      {formatDay(d.date, i)}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {Math.round(d.tempMin)}°
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function ForecastMetric({
  icon: Icon,
  label,
  value,
  suffix,
  iconClass,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
  suffix?: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">

      <div className="flex items-center gap-2">

        <Icon className={`h-4 w-4 ${iconClass}`} />

        <span className="text-[11px] font-medium text-slate-500">
          {label}
        </span>

      </div>

      <div className="mt-2">

        <span className="text-lg font-bold text-white">
          {value}
        </span>

        {suffix && (
          <span className="ml-1 text-[10px] text-slate-500">
            {suffix}
          </span>
        )}

      </div>

    </div>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-white/[0.035] px-2 py-2">

      <div className="flex items-center gap-1">

        <Icon className="h-3 w-3 text-sky-400" />

        <span className="text-[10px] font-bold text-slate-300">
          {value}
        </span>

      </div>

      <p className="mt-0.5 text-[9px] text-slate-600">
        {label}
      </p>

    </div>
  );
}

function SunRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-white/5 p-2.5">
          <Icon className={`h-5 w-5 ${className}`} />
        </div>

        <span className="text-sm font-medium text-slate-400">
          {label}
        </span>

      </div>

      <span className="text-sm font-bold text-white">
        {value}
      </span>

    </div>
  );
}