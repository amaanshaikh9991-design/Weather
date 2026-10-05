import { useEffect, useState } from "react";

import {
  Home,
  MessageCircle,
  ClipboardList,
  Bell,
  CloudSun,
  BarChart3,
  MapPin,
  Mic,
  ShieldAlert,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { useWeather } from "../context/WeatherContext";
import { getActiveAlerts } from "../lib/alerts";


// ============================================================
// PAGE TYPES
// ============================================================

export type PageKey =
  | "dashboard"
  | "chat"
  | "advisory"
  | "disaster"
  | "alerts"
  | "forecast"
  | "analysis"
  | "map"
  | "voice";


// ============================================================
// NAVIGATION ITEM
// ============================================================

interface NavItem {
  key: PageKey;
  label: string;
  icon: LucideIcon;
}


// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "Home",
    icon: Home,
  },

  {
    key: "chat",
    label: "Chat",
    icon: MessageCircle,
  },

  {
    key: "advisory",
    label: "Advisory",
    icon: ClipboardList,
  },

  {
    key: "alerts",
    label: "Alerts",
    icon: Bell,
  },

  // ==========================================================
  // NEW: DISASTER MANAGEMENT
  // ==========================================================

  {
    key: "disaster",
    label: "Disaster",
    icon: ShieldAlert,
  },

  {
    key: "forecast",
    label: "Forecast",
    icon: CloudSun,
  },

  {
    key: "analysis",
    label: "Analysis",
    icon: BarChart3,
  },

  {
    key: "map",
    label: "Map",
    icon: MapPin,
  },

  {
    key: "voice",
    label: "Voice",
    icon: Mic,
  },
];


// ============================================================
// LOCAL STORAGE KEY
// ============================================================

const SEEN_ALERTS_KEY = "weathergpt_seen_alert_count";


// ============================================================
// PROPS
// ============================================================

interface Props {
  active: PageKey;
  onChange: (key: PageKey) => void;
  open: boolean;
  onToggle: () => void;
}


// ============================================================
// SIDEBAR COMPONENT
// ============================================================

export default function Sidebar({
  active,
  onChange,
  open,
  onToggle,
}: Props) {

  const {
    current,
    daily,
    airQuality,
  } = useWeather();


  // ==========================================================
  // GET CURRENT ACTIVE ALERT COUNT
  // ==========================================================

  const activeAlertCount = getActiveAlerts({
    current,
    daily,
    airQuality,
  }).length;


  // ==========================================================
  // REMEMBER HOW MANY ALERTS USER HAS ALREADY SEEN
  // ==========================================================

  const [seenAlertCount, setSeenAlertCount] = useState(() => {

    try {

      const saved = localStorage.getItem(
        SEEN_ALERTS_KEY
      );

      return saved ? Number(saved) : 0;

    } catch {

      return 0;

    }

  });


  // ==========================================================
  // MARK ALERTS AS SEEN WHEN USER OPENS ALERTS
  // ==========================================================

  useEffect(() => {

    if (active === "alerts") {

      setSeenAlertCount(activeAlertCount);

      try {

        localStorage.setItem(
          SEEN_ALERTS_KEY,
          String(activeAlertCount)
        );

      } catch {

        // Ignore localStorage errors.

      }

    }

  }, [
    active,
    activeAlertCount,
  ]);


  // ==========================================================
  // CALCULATE NEW ALERT COUNT
  // ==========================================================

  const newAlertCount = Math.max(
    0,
    activeAlertCount - seenAlertCount
  );


  // ==========================================================
  // SIDEBAR UI
  // ==========================================================

  return (

    <aside
      className={`
        wx-sidebar
        flex
        h-screen
        w-[86px]
        shrink-0
        flex-col
        items-center
        py-5
        ${open ? "is-open" : ""}
      `}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="wx-menu-button"
      >
        <span className={`wx-menu-line ${open ? "rotate-top" : ""}`} />
        <span className={`wx-menu-line ${open ? "hide-middle" : ""}`} />
        <span className={`wx-menu-line ${open ? "rotate-bottom" : ""}`} />
      </button>

      <nav
        className="
          flex
          w-full
          flex-1
          flex-col
          items-center
          justify-center
          gap-2
        "
      >

        {NAV_ITEMS.map((item) => {

          const Icon = item.icon;

          const isActive =
            active === item.key;


          return (

            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`
                wx-sidebar-item
                w-[74px]
                ${isActive ? "active" : ""}
              `}
            >

              {/* =================================================
                  ICON
              ================================================= */}

              <span
                className="
                  relative
                  flex
                  items-center
                  justify-center
                "
              >

                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={
                    isActive ? 2.3 : 1.8
                  }
                />


                {/* =================================================
                    ALERT BADGE
                ================================================= */}

                {item.key === "alerts" &&
                  newAlertCount > 0 && (

                    <span
                      className="
                        absolute
                        -right-2
                        -top-2
                        flex
                        h-4
                        min-w-4
                        items-center
                        justify-center
                        rounded-full
                        bg-red-500
                        px-1
                        text-[9px]
                        font-bold
                        leading-none
                        text-white
                        shadow-lg
                        shadow-red-500/30
                      "
                    >

                      {newAlertCount > 9
                        ? "9+"
                        : newAlertCount}

                    </span>

                  )}

              </span>


              {/* =================================================
                  LABEL
              ================================================= */}

              <span
                className="
                  text-[11px]
                  font-medium
                "
              >
                {item.label}
              </span>

            </button>

          );

        })}

      </nav>

    </aside>

  );
}