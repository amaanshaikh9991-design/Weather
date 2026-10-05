import { useEffect, useRef, useState } from "react";
import { Send, Mic, Sparkles, Droplets, Wind, Gauge, Sun } from "lucide-react";
import { useWeather } from "../context/WeatherContext";
import { loadChatHistory, sendChatMessage } from "../services/chatApi";
import { fetchOfficialAlerts } from "../services/alertsApi";
import WeatherIcon from "../components/WeatherIcon";
import { describeWeatherCode } from "../services/weatherApi";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
}

const SUGGESTIONS = [
  "What's the humidity right now?",
  "Will it rain today?",
  "What's the forecast this week?",
  "How's the air quality?",
  "What should a farmer do before heavy rain?",
  "Give me an irrigation idea for today's weather",
];

export default function Chat() {
  const weather = useWeather();
  const { current, location } = weather;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "bot",
      text: "Hi! I'm your WeatherGPT assistant, connected to live weather and official alert data. Ask about weather, farming decisions, crop care, irrigation, livestock, or disaster safety.",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [officialAlerts, setOfficialAlerts] = useState<Awaited<ReturnType<typeof fetchOfficialAlerts>>>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(2);

  useEffect(() => {
    loadChatHistory()
      .then((history) => {
        if (history.length > 0) {
          setMessages(
            history.map((message, index) => ({
              id: index + 1,
              role: message.role === "user" ? "user" : "bot",
              text: message.text,
            }))
          );
          idRef.current = history.length + 1;
        }
      })
      .catch((loadError) => {
        console.error("Chat history error:", loadError);
        setError("Your private chat history could not be loaded.");
      });
  }, []);

  useEffect(() => {
    if (!location) return;
    fetchOfficialAlerts(location.latitude, location.longitude)
      .then(setOfficialAlerts)
      .catch((alertError) => console.error("Official alert error:", alertError));
  }, [location]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setError(null);
    setMessages((m) => [
      ...m,
      { id: idRef.current++, role: "user", text: trimmed },
    ]);
    setInput("");
    setTyping(true);

    try {
      const response = await sendChatMessage(trimmed, {
        location,
        current,
        daily: weather.daily,
        airQuality: weather.airQuality,
      }, officialAlerts);
      setMessages((m) => [
        ...m,
        { id: idRef.current++, role: "bot", text: response },
      ]);
    } catch (sendError) {
      console.error("Chat error:", sendError);
      setError(sendError instanceof Error ? sendError.message : "The assistant is unavailable.");
    } finally {
      setTyping(false);
    }
  }

  function handleMic() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setError("I couldn't hear that. Please try again.");
    };

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      send(transcript);
    };

    recognition.start();
  }

  const info = current
    ? describeWeatherCode(current.weatherCode, current.isDay)
    : null;

  return (
    <div className="wx-fade-in flex h-full gap-5 p-6">
      <div className="wx-panel flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b wx-divider px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-600" />

            <h2 className="text-base font-semibold text-[color:var(--wx-text)]">
              Weather AI Chat
            </h2>

            <span className="wx-badge bg-blue-500/15 text-blue-400">
              BETA
            </span>
          </div>

          <span className="text-xs text-[color:var(--wx-text-dim)]">
            {location ? `Context: ${location.city}` : "Locating..."}
          </span>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="wx-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "wx-bubble-user text-white"
                    : "wx-bubble-bot text-[color:var(--wx-text)]"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing */}
          {typing && (
            <div className="flex justify-start">
              <div className="wx-bubble-bot wx-typing px-4 py-3">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t wx-divider p-3">
          {error && (
            <p className="mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Suggestions */}
          <div className="mb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-[color:var(--wx-border)] bg-white/5 px-3 py-1.5 text-xs text-[color:var(--wx-text-dim)] transition hover:border-blue-400/50 hover:text-[color:var(--wx-text)]"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Row */}
          <div className="flex items-center gap-2">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  send(input);
                }
              }}
              placeholder="Ask anything about weather..."
              className="flex-1 rounded-xl border border-[color:var(--wx-border)] bg-white/5 px-4 py-3 text-sm text-[color:var(--wx-text)] placeholder:text-[color:var(--wx-text-dim)] outline-none focus:border-blue-400/60"
            />

            <button
              onClick={handleMic}
              aria-label={listening ? "Listening" : "Ask by voice"}
              disabled={typing || listening}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--wx-border)] bg-white/5 text-[color:var(--wx-text-dim)] transition hover:border-blue-400/50 hover:text-[color:var(--wx-text)]"
            >
              <Mic className={`h-4 w-4 ${listening ? "text-red-500" : ""}`} />
            </button>

            <button
              onClick={() => send(input)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 transition hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>

          </div>
        </div>
      </div>

      {/* Live Snapshot Side Panel */}
      <div className="hidden w-72 shrink-0 flex-col gap-4 lg:flex">

        <div className="wx-panel p-5">
          <h3 className="mb-3 text-sm font-semibold text-[color:var(--wx-text)]">
            Live Snapshot
          </h3>

          {current && info ? (
            <>
              <div className="flex items-center gap-3">
                <WeatherIcon
                  code={current.weatherCode}
                  isDay={current.isDay}
                  className="h-10 w-10 text-blue-500"
                />

                <div>
                  <div className="text-2xl font-bold text-[color:var(--wx-text)]">
                    {Math.round(current.temperature)}°C
                  </div>

                  <div className="text-xs text-[color:var(--wx-text-dim)]">
                    {info.label}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <Row
                  icon={Droplets}
                  label="Humidity"
                  value={`${Math.round(current.humidity)}%`}
                  color="#0284c7"
                />

                <Row
                  icon={Wind}
                  label="Wind"
                  value={`${Math.round(current.windSpeed)} km/h`}
                  color="#0891b2"
                />

                <Row
                  icon={Gauge}
                  label="Pressure"
                  value={`${Math.round(current.pressure)} hPa`}
                  color="#7c3aed"
                />

                <Row
                  icon={Sun}
                  label="UV Index"
                  value={current.uvIndex.toFixed(1)}
                  color="#ea580c"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-[color:var(--wx-text-dim)]">
              Loading data...
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="wx-panel p-5">
          <h3 className="mb-2 text-sm font-semibold text-[color:var(--wx-text)]">
            Tips
          </h3>

          <p className="text-xs leading-relaxed text-[color:var(--wx-text-dim)]">
            Try asking: "feels like temperature", "UV index today",
            "wind speed", or "forecast for the week" — answers are
            generated from real-time data for{" "}
            {location?.city ?? "your area"}.
          </p>
        </div>

      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[color:var(--wx-text-dim)]">
        <Icon
          className="h-3.5 w-3.5"
          style={{ color }}
        />
        {label}
      </span>

      <span className="font-medium text-[color:var(--wx-text)]">
        {value}
      </span>
    </div>
  );
}