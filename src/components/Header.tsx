import { useEffect, useState } from "react";
import { LocateFixed, RefreshCw, User, Menu, X } from "lucide-react";
import { useWeather } from "../context/WeatherContext";

export default function Header({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const [now, setNow] = useState(new Date());
  const { location, loading, refresh, useMyLocation, lastUpdated } = useWeather();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="wx-header flex h-[76px] shrink-0 items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400/20 hover:text-white"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="wx-logo-mark flex h-11 w-11 items-center justify-center rounded-2xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6 text-white"
          >
            <path
              d="M17.5 18a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.35 9.05 4.5 4.5 0 0 0 5 18h12.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 21v-1M12 21.5v-1.5M15 21v-1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-[17px] font-bold leading-tight tracking-tight text-white">
            WeatherGPT
          </h1>

          <p className="text-[10px] font-semibold tracking-[0.14em] text-[color:var(--wx-text-dim)]">
            AI METEOROLOGICAL INTELLIGENCE
          </p>
        </div>
      </div>

      {/* Live information */}
      <div className="hidden items-center gap-6 md:flex">
        <div className="flex items-center gap-2">
          <span className="wx-live-dot" />

          <span className="text-xs font-semibold text-emerald-600">
            LIVE
          </span>
        </div>

        <div className="h-8 w-px bg-[color:var(--wx-border)]" />

        <div className="text-right">
          <div className="font-mono text-lg font-semibold text-white">
            {timeStr}
          </div>

          <div className="text-[11px] text-[color:var(--wx-text-dim)]">
            {dateStr}
          </div>
        </div>

        <div className="h-8 w-px bg-[color:var(--wx-border)]" />

        <div className="max-w-[180px] text-right">
          <div className="truncate text-sm font-semibold text-white">
            {location ? `${location.city}` : "Locating..."}
          </div>

          <div className="text-[11px] text-[color:var(--wx-text-dim)]">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Fetching..."}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={useMyLocation}
          title="Use my location"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--wx-border)] text-[color:var(--wx-text-dim)] transition hover:border-[color:var(--wx-border-strong)] hover:bg-white/60 hover:text-white"
        >
          <LocateFixed className="h-4 w-4" />
        </button>

        <button
          onClick={refresh}
          title="Refresh data"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--wx-border)] text-[color:var(--wx-text-dim)] transition hover:border-[color:var(--wx-border-strong)] hover:bg-white/60 hover:text-white"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
        </button>

        <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 ring-1 ring-white/60 shadow-lg shadow-blue-500/30">
          <User className="h-5 w-5 text-white" />
        </div>
      </div>
    </header>
  );
}