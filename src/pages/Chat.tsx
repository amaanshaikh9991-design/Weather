import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Send, Mic, Sparkles, Droplets, Wind, Gauge, Sun } from "lucide-react";
import { useWeather } from "../context/WeatherContext";
import { sendChatMessage } from "../services/chatApi";
import { fetchOfficialAlerts } from "../services/alertsApi";
import WeatherIcon from "../components/WeatherIcon";
import { describeWeatherCode } from "../services/weatherApi";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
}

function formatInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-[color:var(--wx-text)]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-black/20 px-1.5 py-0.5 text-[0.9em] text-cyan-300">{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}

function isTableRow(line: string): boolean {
  return line.includes("|") && line.split("|").length >= 3;
}

function isTableDivider(line: string): boolean {
  return isTableRow(line) && line.replace(/[|\s:-]/g, "") === "";
}

function tableCells(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let index = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={`paragraph-${index++}`} className="whitespace-pre-wrap">
        {formatInline(paragraph.join(" "))}
      </p>
    );
    paragraph = [];
  };

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      flushParagraph();
      index += 1;
      continue;
    }

    if (isTableRow(line) && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      flushParagraph();
      const headers = tableCells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && isTableRow(lines[index])) {
        if (!isTableDivider(lines[index])) rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={`table-${index}`} className="my-3 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[520px] border-collapse text-left text-xs">
            <thead className="bg-white/[0.06] text-slate-200">
              <tr>{headers.map((cell, cellIndex) => <th key={cellIndex} className="border-b border-white/10 px-3 py-2 font-semibold">{formatInline(cell)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-white/5 last:border-0">
                  {headers.map((_, cellIndex) => <td key={cellIndex} className="px-3 py-2 align-top text-slate-300">{formatInline(row[cellIndex] ?? "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push(<h4 key={`heading-${index++}`} className="mt-3 font-semibold text-cyan-200">{formatInline(heading[1])}</h4>);
      index += 1;
      continue;
    }

    const listItem = line.match(/^(?:[-*•]|\d+\.)\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      const ordered = /^\d+\./.test(line);
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(ordered ? /^\d+\.\s+(.+)$/ : /^(?:[-*•])\s+(.+)$/);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List key={`list-${index}`} className={`my-2 space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{formatInline(item)}</li>)}
        </List>
      );
      continue;
    }

    paragraph.push(line);
    index += 1;
  }

  flushParagraph();
  return <div className="space-y-2">{blocks}</div>;
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
                {m.role === "bot" ? <FormattedMessage text={m.text} /> : m.text}
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