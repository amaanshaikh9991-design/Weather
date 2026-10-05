import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeather } from "../context/WeatherContext";

interface ThemeColors {
  bg: string;
  glow1: string;
  glow2: string;
  glow3: string;
  text: string;
  accent: string;
}

const THEMES: Record<string, ThemeColors> = {
  sunny: {
    bg: "from-blue-50 via-sky-50 to-orange-50",
    glow1: "bg-orange-300/40",
    glow2: "bg-yellow-200/30",
    glow3: "bg-blue-300/20",
    text: "text-slate-900",
    accent: "text-orange-500",
  },

  cloudy: {
    bg: "from-slate-100 via-gray-100 to-zinc-100",
    glow1: "bg-gray-300/30",
    glow2: "bg-slate-200/40",
    glow3: "bg-white/50",
    text: "text-slate-800",
    accent: "text-slate-500",
  },

  rainy: {
    bg: "from-slate-900 via-gray-900 to-slate-800",
    glow1: "bg-blue-600/20",
    glow2: "bg-indigo-500/15",
    glow3: "bg-cyan-400/10",
    text: "text-slate-100",
    accent: "text-blue-400",
  },

  stormy: {
    bg: "from-gray-950 via-slate-900 to-black",
    glow1: "bg-purple-600/20",
    glow2: "bg-indigo-600/15",
    glow3: "bg-blue-500/10",
    text: "text-slate-100",
    accent: "text-purple-400",
  },

  night: {
    bg: "from-indigo-950 via-slate-900 to-black",
    glow1: "bg-indigo-500/20",
    glow2: "bg-purple-500/15",
    glow3: "bg-blue-400/10",
    text: "text-slate-100",
    accent: "text-indigo-300",
  },

  snow: {
    bg: "from-slate-50 via-blue-50 to-white",
    glow1: "bg-blue-200/30",
    glow2: "bg-cyan-100/40",
    glow3: "bg-white/60",
    text: "text-slate-800",
    accent: "text-cyan-600",
  },
};

function getWeatherTheme(
  code: number,
  isDay: boolean
): keyof typeof THEMES {
  // If it is night
  if (!isDay) return "night";

  // Clear sky
  if (code === 0) return "sunny";

  // Mainly clear / partly cloudy / overcast
  if ([1, 2, 3].includes(code)) return "cloudy";

  // Fog
  if ([45, 48].includes(code)) return "cloudy";

  // Rain / drizzle / showers
  if (
    [
      51, 53, 55, 56, 57,
      61, 63, 65, 66, 67,
      80, 81, 82,
    ].includes(code)
  ) {
    return "rainy";
  }

  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return "stormy";
  }

  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "snow";
  }

  // Fallback
  return "sunny";
}

export default function DynamicBackground() {
  const { current } = useWeather();

  const [themeKey, setThemeKey] =
    useState<keyof typeof THEMES>("sunny");

  useEffect(() => {
    if (current) {
      // Make sure isDay is always boolean
      const isDay =
        typeof current.isDay === "boolean"
          ? current.isDay
          : current.isDay === 1;

      const key = getWeatherTheme(
        current.weatherCode,
        isDay
      );

      setThemeKey(key);
    }
  }, [current]);

  const theme = THEMES[themeKey];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">

      {/* Base Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.bg} transition-all duration-1000 ease-in-out`}
      />

      {/* Animated Glow Orbs */}
      <AnimatePresence mode="wait">

        {/* Glow 1 */}
        <motion.div
          key={themeKey + "-glow1"}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
          className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] mix-blend-screen ${theme.glow1}`}
        >
          <motion.div
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -20, 20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-full h-full"
          />
        </motion.div>

        {/* Glow 2 */}
        <motion.div
          key={themeKey + "-glow2"}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 1.5,
            delay: 0.2,
            ease: "easeInOut",
          }}
          className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] mix-blend-screen ${theme.glow2}`}
        >
          <motion.div
            animate={{
              x: [0, -40, 40, 0],
              y: [0, 30, -30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-full h-full"
          />
        </motion.div>

        {/* Glow 3 */}
        <motion.div
          key={themeKey + "-glow3"}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 2,
            delay: 0.5,
          }}
          className={`absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full blur-[80px] mix-blend-overlay ${theme.glow3}`}
        />

      </AnimatePresence>

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

    </div>
  );
}