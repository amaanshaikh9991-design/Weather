import { useState } from "react";
import {
  Sun,
  Umbrella,
  Wind,
  Shirt,
  Activity,
  Leaf,
  Car,
  Droplets,
  X,
  RefreshCw,
  Sprout,
  ThermometerSun,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWeather } from "../context/WeatherContext";

interface AdvisoryCard {
  icon: LucideIcon;
  title: string;
  level: "Low" | "Moderate" | "High";
  message: string;
  color: string;
  details: string[];
  stats: {
    label: string;
    value: string;
  }[];
}

export default function Advisory() {
  const { current, daily, airQuality, location, loading, lastUpdated, refresh } = useWeather();
  const [openCard, setOpenCard] = useState<AdvisoryCard | null>(null);

  if (loading && !current) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="wx-fade-in wx-scroll h-full overflow-y-auto p-4 md:p-6">
        <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.10] to-slate-900/70 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Weather guidance
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">Your advisory is ready</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                Allow location access or choose a location from the Disaster page to receive recommendations based on live temperature, rain, wind, UV, and air-quality data.
              </p>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              <RefreshCw className="h-4 w-4" />
              Try live data
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Before field work", "Check rain probability and wind gusts. Avoid spraying before rain or during strong wind."],
            ["Irrigation check", "Feel the soil or use a moisture meter before watering. Water early and target the root zone."],
            ["Heat safety", "Plan heavy work for cooler hours, drink water regularly, and provide shade for livestock."],
            ["Rain preparation", "Clear drainage channels, protect stored grain, and keep tools and electrical equipment dry."],
            ["Crop health", "After humid or wet weather, inspect leaves for fungal symptoms and improve airflow between plants."],
            ["Emergency readiness", "Keep local authority contacts accessible and follow official alerts during floods, cyclones, or earthquakes."],
          ].map(([title, text]) => (
            <div key={title} className="wx-panel border-white/10 bg-white/[0.035] p-5">
              <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-100">
          Live advisory data is not available yet. These are general safety guidelines, not crop-specific medical, pesticide, or emergency instructions.
        </div>
      </div>
    );
  }

  const today = daily[0];
  const tomorrow = daily[1];
  const rainChance = today?.precipitationProbability ?? 0;
  const temp = current.temperature;
  const cards: AdvisoryCard[] = [];

  const farmGuidance = [
    {
      icon: Sprout,
      title: "Field work window",
      text:
        rainChance >= 60
          ? "Prioritize drainage checks and postpone spraying or fertilizer application until leaves are dry."
          : current.windGusts >= 35
            ? "Use sheltered morning hours for field work and secure nursery sheets before gusts strengthen."
            : "Conditions are suitable for routine field work. Check soil moisture before irrigation.",
      color: "#22c55e",
    },
    {
      icon: Droplets,
      title: "Irrigation decision",
      text:
        rainChance >= 50
          ? `Rain probability is ${rainChance}%. Inspect soil first and avoid routine irrigation if rain arrives.`
          : current.humidity >= 75
            ? "Humidity is high. Water at the root zone early, avoid wetting foliage, and watch for fungal symptoms."
            : "Use a soil-moisture check before watering. Early morning irrigation reduces evaporation.",
      color: "#06b6d4",
    },
    {
      icon: ThermometerSun,
      title: "Crop and livestock stress",
      text:
        temp >= 35
          ? "Provide shade, clean drinking water, and shorter work periods for livestock and field workers."
          : temp <= 10
            ? "Protect temperature-sensitive crops and provide dry shelter for livestock overnight."
            : "Thermal stress is currently limited; continue normal crop and livestock checks.",
      color: "#f59e0b",
    },
  ];

  /* ---------------------------------
     UV / Sun protection
  ---------------------------------- */

  if (current.uvIndex >= 8) {
    cards.push({
      icon: Sun,
      title: "Sun Protection",
      level: "High",
      message: `UV index is very high at ${current.uvIndex.toFixed(
        1
      )}. Wear SPF 30+ sunscreen, sunglasses, and a hat. Avoid midday sun.`,
      color: "#ea580c",
      details: [
        "Reapply SPF 30+ sunscreen every 2 hours if outdoors.",
        "Seek shade between 11 AM and 3 PM, when UV is strongest.",
        "Wear a wide-brim hat and UV-blocking sunglasses.",
        "Unprotected skin can burn in under 15 minutes at this level.",
      ],
      stats: [
        {
          label: "UV index",
          value: current.uvIndex.toFixed(1),
        },
        {
          label: "Peak risk window",
          value: "11 AM – 3 PM",
        },
      ],
    });

  } else if (current.uvIndex >= 4) {
    cards.push({
      icon: Sun,
      title: "Sun Protection",
      level: "Moderate",
      message: `UV index is moderate at ${current.uvIndex.toFixed(
        1
      )}. Sunscreen recommended for extended outdoor time.`,
      color: "#ea580c",
      details: [
        "Apply SPF 30+ sunscreen if you'll be outside more than an hour.",
        "Sunglasses recommended in direct sunlight.",
        "Fair skin burns faster — take extra care around midday.",
      ],
      stats: [
        {
          label: "UV index",
          value: current.uvIndex.toFixed(1),
        },
      ],
    });
  } else {
    cards.push({
      icon: Sun,
      title: "Sun Protection",
      level: "Low",
      message: `UV index is low at ${current.uvIndex.toFixed(
        1
      )}. Minimal sun protection needed.`,
      color: "#16a34a",
      details: [
        "Low burn risk for most skin types today.",
        "Still worth sunscreen for babies or very fair skin.",
      ],
      stats: [
        {
          label: "UV index",
          value: current.uvIndex.toFixed(1),
        },
      ],
    });
  }

  /* ---------------------------------
     Rain / Umbrella
  ---------------------------------- */

  cards.push({
    icon: Umbrella,
    title: "Rain Outlook",
    level:
      rainChance >= 60
        ? "High"
        : rainChance >= 30
        ? "Moderate"
        : "Low",
    message:
      rainChance >= 60
        ? `${rainChance}% chance of rain today. Carry an umbrella and wear waterproof footwear.`
        : rainChance >= 30
        ? `${rainChance}% chance of showers. Keep an umbrella handy just in case.`
        : `Only ${rainChance}% chance of rain. Skies expected to stay mostly dry.`,
    color: rainChance >= 60 ? "#2563eb" : "#0891b2",
    details:
      rainChance >= 60
        ? [
            "Carry a compact umbrella or raincoat.",
            "Waterproof or closed-toe footwear recommended.",
            "Allow extra travel time — wet roads slow traffic.",
            "Keep electronics in a waterproof bag or case.",
          ]
        : rainChance >= 30
        ? [
            "Keep a compact umbrella within reach.",
            "Showers likely brief and scattered rather than steady.",
          ]
        : [
            "No rain gear needed for most of the day.",
            "Conditions can still shift — check back before heading out late.",
          ],
    stats: [
      {
        label: "Rain chance",
        value: `${rainChance}%`,
      },
      {
        label: "Current precipitation",
        value: `${current.precipitation ?? 0} mm`,
      },
    ],
  });

  /* ---------------------------------
     Wind / Travel
  ---------------------------------- */

  cards.push({
    icon: Wind,
    title: "Wind & Travel",
    level:
      current.windGusts >= 40
        ? "High"
        : current.windGusts >= 20
        ? "Moderate"
        : "Low",
    message:
      current.windGusts >= 40
        ? `Strong gusts up to ${Math.round(
            current.windGusts
          )} km/h. Avoid two-wheelers and secure loose items.`
        : current.windGusts >= 20
        ? `Breezy conditions with gusts to ${Math.round(
            current.windGusts
          )} km/h. Drive with extra caution.`
        : `Calm winds at ${Math.round(
            current.windSpeed
          )} km/h. Great conditions for travel.`,
    color: "#0891b2",
    details:
      current.windGusts >= 40
        ? [
            "Two-wheeler and cycling travel not recommended.",
            "Secure loose outdoor items — furniture, signage, plants.",
            "High-sided vehicles should watch for sudden gusts on open roads.",
          ]
        : current.windGusts >= 20
        ? [
            "Hold onto umbrellas and hats in open areas.",
            "Two-wheeler riders should reduce speed on exposed roads.",
          ]
        : [
            "No wind-related travel restrictions today.",
            "Good conditions for cycling and outdoor plans.",
          ],
    stats: [
      {
        label: "Sustained wind",
        value: `${Math.round(current.windSpeed)} km/h`,
      },
      {
        label: "Gusts",
        value: `${Math.round(current.windGusts)} km/h`,
      },
    ],
  });

  /* ---------------------------------
     Clothing
  ---------------------------------- */

  cards.push({
    icon: Shirt,
    title: "What to Wear",
    level:
      temp >= 32 || temp <= 8
        ? "High"
        : "Moderate",
    message:
      temp >= 32
        ? "Light, breathable fabrics recommended. Stay hydrated throughout the day."
        : temp <= 8
        ? "Layer up with warm clothing, gloves, and a jacket."
        : "Comfortable weather — light layers should work well.",
    color: "#7c3aed",
    details:
      temp >= 32
        ? [
            "Choose loose, light-colored, breathable fabrics.",
            "Cotton or linen over synthetics to reduce heat trapping.",
            "A hat helps if you're outside for long stretches.",
          ]
        : temp <= 8
        ? [
            "Layer with a thermal base, insulating mid-layer, and windproof outer shell.",
            "Gloves and a hat cut most heat loss.",
            "Waterproof footwear if rain is also in the forecast.",
          ]
        : [
            "A light layer or jacket for morning/evening is enough.",
            "No heavy outerwear needed at this temperature.",
          ],
    stats: [
      {
        label: "Current temp",
        value: `${Math.round(temp)}°C`,
      },
      {
        label: "Feels like",
        value: `${Math.round(
          current.apparentTemperature
        )}°C`,
      },
    ],
  });

  /* ---------------------------------
     Outdoor activity
  ---------------------------------- */

  const goodOutdoor =
    temp >= 15 &&
    temp <= 32 &&
    rainChance < 50 &&
    current.windGusts < 35;

  cards.push({
    icon: Activity,
    title: "Outdoor Activity",
    level: goodOutdoor ? "Low" : "Moderate",
    message: goodOutdoor
      ? "Conditions are favorable for outdoor activities and sports today."
      : "Conditions are less ideal for extended outdoor activity — plan accordingly.",
    color: goodOutdoor ? "#16a34a" : "#ea580c",
    details: goodOutdoor
      ? [
          "Good conditions for running, cycling, or team sports.",
          "Stay hydrated even in comfortable temperatures.",
        ]
      : [
          temp > 32
            ? "High heat — limit strenuous activity to early morning or evening."
            : temp < 15
            ? "Cooler temperatures — warm up before intense activity."
            : "Consider indoor alternatives if rain or wind picks up.",
          "Check the hourly forecast before committing to long outdoor plans.",
        ],
    stats: [
      {
        label: "Temp",
        value: `${Math.round(temp)}°C`,
      },
      {
        label: "Rain chance",
        value: `${rainChance}%`,
      },
      {
        label: "Gusts",
        value: `${Math.round(current.windGusts)} km/h`,
      },
    ],
  });

  /* ---------------------------------
     Air quality
  ---------------------------------- */

  if (airQuality?.usAqi != null) {
    const aqi = airQuality.usAqi;

    cards.push({
      icon: Leaf,
      title: "Air Quality",
      level:
        aqi > 150
          ? "High"
          : aqi > 100
          ? "Moderate"
          : "Low",
      message:
        aqi > 150
          ? `US AQI at ${Math.round(
              aqi
            )}. Sensitive groups should avoid prolonged outdoor exertion.`
          : aqi > 100
          ? `US AQI at ${Math.round(
              aqi
            )}. Acceptable for most, but sensitive individuals take care.`
          : `US AQI at ${Math.round(
              aqi
            )}. Air quality is good.`,
      color:
        aqi > 150
          ? "#dc2626"
          : aqi > 100
          ? "#ea580c"
          : "#16a34a",
      details:
        aqi > 150
          ? [
              "People with asthma or heart conditions should limit outdoor exertion.",
              "Consider a mask (N95) for extended time outside.",
              "Keep windows closed during peak pollution hours.",
            ]
          : aqi > 100
          ? [
              "Sensitive groups should reduce prolonged outdoor exertion.",
              "Most people can continue normal outdoor activity.",
            ]
          : [
              "Safe for normal outdoor activity for all groups.",
              "Good day for exercising outside.",
            ],
      stats: [
        {
          label: "US AQI",
          value: `${Math.round(aqi)}`,
        },
        {
          label: "PM2.5",
          value: `${airQuality.pm2_5?.toFixed(1) ?? "--"}`,
        },
        {
          label: "PM10",
          value: `${airQuality.pm10?.toFixed(1) ?? "--"}`,
        },
      ],
    });
  }

  /* ---------------------------------
     Driving
  ---------------------------------- */

  cards.push({
    icon: Car,
    title: "Driving Conditions",
    level:
      current.precipitation > 0 ||
      current.windGusts >= 40
        ? "High"
        : "Low",
    message:
      current.precipitation > 0
        ? "Wet roads reported. Reduce speed and increase following distance."
        : "Roads are dry with clear visibility for driving.",
    color: "#0284c7",
    details:
      current.precipitation > 0
        ? [
            "Reduce speed on wet or flooded stretches.",
            "Increase following distance — wet braking takes longer.",
            "Turn on headlights even during the day for visibility.",
          ]
        : [
            "Dry roads with normal stopping distances.",
            "Clear visibility expected for the drive.",
          ],
    stats: [
      {
        label: "Precipitation",
        value: `${current.precipitation ?? 0} mm`,
      },
      {
        label: "Gusts",
        value: `${Math.round(current.windGusts)} km/h`,
      },
    ],
  });

  /* ---------------------------------
     Hydration
  ---------------------------------- */

  cards.push({
    icon: Droplets,
    title: "Hydration",
    level: temp >= 30 ? "High" : "Low",
    message:
      temp >= 30
        ? "High temperatures increase dehydration risk. Drink water regularly throughout the day."
        : "Normal hydration levels recommended.",
    color: "#0284c7",
    details:
      temp >= 30
        ? [
            "Aim for water every 30–45 minutes if active outdoors.",
            "Watch for early signs: fatigue, headache, dark urine.",
            "Add electrolytes if sweating heavily.",
          ]
        : [
            "Standard daily water intake is enough today.",
            "Increase intake if you're exercising or outdoors for long periods.",
          ],
    stats: [
      {
        label: "Temp",
        value: `${Math.round(temp)}°C`,
      },
    ],
  });

  return (
    <div className="wx-fade-in wx-scroll h-full overflow-y-auto p-6">
      <div className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--wx-text)]">Weather Advisory</h2>
            <p className="mt-1 text-sm text-[color:var(--wx-text-dim)]">
              Actionable recommendations for {location?.city ?? "your area"} from live forecast data.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[color:var(--wx-border)] bg-white/5 px-3 py-2 text-xs font-semibold text-[color:var(--wx-text-dim)] transition hover:border-cyan-400/50 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh advice
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-3 text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span>Based on current conditions and the next forecast period.</span>
          <span className="text-slate-500">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : "Updating"}
          </span>
          {tomorrow && <span className="text-slate-500">Tomorrow rain: {tomorrow.precipitationProbability}%</span>}
        </div>
      </div>

      <section className="mb-6">
        <div className="mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">Farmer action plan</h3>
          <p className="mt-1 text-xs text-slate-500">Practical, condition-based guidance — not a substitute for local agricultural officers.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {farmGuidance.map((item) => (
            <div key={item.title} className="wx-panel border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2" style={{ background: `${item.color}1a` }}>
                  <item.icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.title}
            type="button"
            onClick={() => setOpenCard(c)}
            className="wx-panel wx-card-hover p-5 text-left"
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: `${c.color}1a`,
                }}
              >
                <c.icon
                  className="h-5 w-5"
                  style={{
                    color: c.color,
                  }}
                />
              </div>

              <span
                className="wx-badge"
                style={{
                  background:
                    c.level === "High"
                      ? "rgba(239,68,68,0.12)"
                      : c.level === "Moderate"
                      ? "rgba(245,158,11,0.12)"
                      : "rgba(34,197,94,0.12)",
                  color:
                    c.level === "High"
                      ? "#dc2626"
                      : c.level === "Moderate"
                      ? "#d97706"
                      : "#16a34a",
                }}
              >
                {c.level.toUpperCase()}
              </span>
            </div>

            <h3 className="mb-1.5 text-sm font-semibold text-[color:var(--wx-text)]">
              {c.title}
            </h3>

            <p className="text-xs leading-relaxed text-[color:var(--wx-text-dim)]">
              {c.message}
            </p>
          </button>
        ))}
      </div>

      {openCard && (
        <AdvisoryDetailModal
          card={openCard}
          onClose={() => setOpenCard(null)}
        />
      )}
    </div>
  );
}

/* ---------------------------------
   Detail Modal
---------------------------------- */

function AdvisoryDetailModal({
  card,
  onClose,
}: {
  card: AdvisoryCard;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background: `${card.color}1a`,
              }}
            >
              <card.icon
                className="h-5 w-5"
                style={{
                  color: card.color,
                }}
              />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[color:var(--wx-text)]">
                {card.title}
              </h3>

              <span
                className="wx-badge mt-1 inline-block"
                style={{
                  background:
                    card.level === "High"
                      ? "rgba(239,68,68,0.12)"
                      : card.level === "Moderate"
                      ? "rgba(245,158,11,0.12)"
                      : "rgba(34,197,94,0.12)",
                  color:
                    card.level === "High"
                      ? "#dc2626"
                      : card.level === "Moderate"
                      ? "#d97706"
                      : "#16a34a",
                }}
              >
                {card.level.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[color:var(--wx-text-dim)] transition-colors hover:bg-white/5 hover:text-[color:var(--wx-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-[color:var(--wx-text-dim)]">
          {card.message}
        </p>

        {card.stats.length > 0 && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {card.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/5 p-3"
              >
                <div className="text-sm font-bold text-[color:var(--wx-text)]">
                  {s.value}
                </div>

                <div className="text-[11px] text-[color:var(--wx-text-dim)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--wx-text-dim)]">
          What to do
        </h4>

        <ul className="space-y-2">
          {card.details.map((detail, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-[color:var(--wx-text)]"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{
                  background: card.color,
                }}
              />

              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}