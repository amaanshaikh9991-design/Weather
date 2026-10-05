import { AlertTriangle, ShieldCheck, Eye, Siren } from "lucide-react";
import { useWeather } from "../context/WeatherContext";
import { getActiveAlerts } from "../lib/alerts";

const SEVERITY_STYLE: Record<string, { bg: string; border: string; text: string; label: string }> = {
  warning: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.3)", text: "#dc2626", label: "WARNING" },
  watch: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)", text: "#d97706", label: "WATCH" },
  advisory: { bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.3)", text: "#0284c7", label: "ADVISORY" },
};

export default function Alerts() {
  const { current, daily, airQuality, location, loading, lastUpdated } = useWeather();

  if (loading && !current) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const alerts = getActiveAlerts({ current, daily, airQuality });

  return (
    <div className="wx-fade-in wx-scroll h-full overflow-y-auto p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Weather Alerts</h2>
          <p className="text-sm text-[color:var(--wx-text-dim)]">
            Live-generated alerts for {location?.city ?? "your area"}
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs text-[color:var(--wx-text-dim)]">
          <Eye className="h-3.5 w-3.5" />
          {lastUpdated ? `Checked ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : ""}
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="wx-panel flex flex-col items-center justify-center gap-3 p-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No Active Alerts</h3>
          <p className="max-w-sm text-sm text-[color:var(--wx-text-dim)]">
            Current conditions in {location?.city ?? "your area"} do not meet any warning, watch, or advisory
            thresholds. We'll notify you here the moment that changes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => {
            const style = SEVERITY_STYLE[a.severity];
            return (
              <div
                key={a.id}
                className="wx-card-hover flex gap-4 rounded-2xl p-5"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${style.text}1a` }}
                >
                  {a.severity === "warning" ? (
                    <Siren className="h-5 w-5" style={{ color: style.text }} />
                  ) : (
                    <AlertTriangle className="h-5 w-5" style={{ color: style.text }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="wx-badge" style={{ background: `${style.text}1a`, color: style.text }}>
                      {style.label}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">{a.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-[color:var(--wx-text-dim)]">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}