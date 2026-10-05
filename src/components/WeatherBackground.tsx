import { useEffect, useMemo, useState } from "react";

import clearDayImg from "../assets/weather-bg/clear-day.jpg";
import clearNightImg from "../assets/weather-bg/clear-night.jpg";
import cloudyImg from "../assets/weather-bg/cloudy.jpg";
import fogImg from "../assets/weather-bg/fog.jpg";
import rainImg from "../assets/weather-bg/rain.jpg";
import snowImg from "../assets/weather-bg/snow.jpg";
import stormImg from "../assets/weather-bg/storm.jpg";

type WeatherCategory =
  | "clear"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

function categorize(code: number): WeatherCategory {
  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";

  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82)
  ) {
    return "rain";
  }

  if (
    (code >= 71 && code <= 77) ||
    code === 85 ||
    code === 86
  ) {
    return "snow";
  }

  if (code >= 95 && code <= 99) return "storm";

  return "cloudy";
}

const IMAGE_MAP = {
  "clear-day": clearDayImg,
  "clear-night": clearNightImg,
  cloudy: cloudyImg,
  fog: fogImg,
  rain: rainImg,
  snow: snowImg,
  storm: stormImg,
} as const;

interface Props {
  code: number;
  isDay: boolean;
  className?: string;
}

export default function WeatherBackground({
  code,
  isDay,
  className = "",
}: Props) {
  const category = categorize(code);

  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const onMq = () => setReduceMotion(mq.matches);
    onMq();
    mq.addEventListener?.("change", onMq);

    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      mq.removeEventListener?.("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const animOn = !reduceMotion && !paused;

  const imageKey =
    category === "clear"
      ? isDay
        ? "clear-day"
        : "clear-night"
      : category;

  const src = IMAGE_MAP[imageKey];

  /* -----------------------------
     RAIN PARTICLES (deterministic)
  ----------------------------- */

  const drops = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: (i * 7.3) % 100,
        delay: (i * 0.17) % 2,
        duration: 0.75 + (i % 5) * 0.12,
        height: 12 + (i % 4) * 4,
      })),
    []
  );

  /* -----------------------------
     SNOW PARTICLES
  ----------------------------- */

  const flakes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: (i * 8.1) % 100,
        delay: (i * 0.4) % 5,
        duration: 5.5 + (i % 4) * 1.2,
        size: 3 + (i % 4),
      })),
    []
  );

  /* -----------------------------
     NIGHT STARS
  ----------------------------- */

  const stars = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: (i * 6.9) % 100,
        top: (i * 4.7) % 60,
        delay: (i * 0.35) % 3,
        size: i % 3 === 0 ? 2 : 1,
      })),
    []
  );

  return (
    <div
      className={`wx-bg pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}
      aria-hidden="true"
      data-paused={paused ? "true" : "false"}
      style={{
        contain: "paint",
      }}
    >
      {/* --------------------------------
          WEATHER BACKGROUND IMAGE
      --------------------------------- */}

      <img
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        className={`wx-bg-image absolute inset-0 h-full w-full object-cover ${
          animOn ? "wx-anim-kenburns" : ""
        }`}
      />

      {/* --------------------------------
          DARK GRADIENT
      --------------------------------- */}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-[#0f172a]/15" />

      {/* --------------------------------
          VIGNETTE
      --------------------------------- */}

      <div className="wx-bg-vignette absolute inset-0" />

      {/* --------------------------------
          CLEAR DAY — SUN GLOW
      --------------------------------- */}

      {category === "clear" && isDay && (
        <div className="absolute right-[10%] top-[8%] h-28 w-28">
          <div className="wx-sun-core absolute inset-[25%] rounded-full bg-yellow-100/90" />

          <div
            className={`absolute inset-0 rounded-full bg-amber-300/30 ${
              animOn ? "wx-anim-sun" : ""
            }`}
          />
        </div>
      )}

      {/* --------------------------------
          CLEAR NIGHT — STARS
      --------------------------------- */}

      {category === "clear" &&
        !isDay &&
        stars.map((star) => (
          <span
            key={star.id}
            className={`absolute rounded-full bg-white ${
              animOn ? "wx-anim-twinkle" : ""
            }`}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

      {/* --------------------------------
          CLOUD / FOG DRIFT
      --------------------------------- */}

      {(category === "cloudy" || category === "fog") && (
        <div
          className={`wx-cloud-layer ${
            animOn ? "" : "wx-anim-paused"
          }`}
        >
          <span className="wx-cloud wx-cloud-a" />
          <span className="wx-cloud wx-cloud-b" />
          <span className="wx-cloud wx-cloud-c" />
        </div>
      )}

      {/* --------------------------------
          RAIN
      --------------------------------- */}

      {(category === "rain" || category === "storm") &&
        drops.map((drop) => (
          <span
            key={drop.id}
            className={`absolute top-0 w-px bg-gradient-to-b from-sky-200/0 via-sky-200/70 to-sky-200/0 ${
              animOn ? "wx-anim-fall" : ""
            }`}
            style={{
              left: `${drop.left}%`,
              height: `${drop.height}px`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
            }}
          />
        ))}

      {/* --------------------------------
          STORM LIGHTNING
      --------------------------------- */}

      {category === "storm" && (
        <div
          className={`absolute inset-0 bg-white ${
            animOn ? "wx-anim-flash" : ""
          }`}
        />
      )}

      {/* --------------------------------
          SNOW
      --------------------------------- */}

      {category === "snow" &&
        flakes.map((flake) => (
          <span
            key={flake.id}
            className={`absolute top-0 rounded-full bg-white/85 ${
              animOn ? "wx-anim-snowfall" : ""
            }`}
            style={{
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
            }}
          />
        ))}
    </div>
  );
}