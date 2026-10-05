import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useWeather } from "../context/WeatherContext";
import { sendChatMessage } from "../services/chatApi";
import { fetchOfficialAlerts } from "../services/alertsApi";

interface Turn {
  id: number;
  role: "user" | "bot";
  text: string;
}

export default function Voice() {
  const weather = useWeather();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [interim, setInterim] = useState("");
  const [officialAlerts, setOfficialAlerts] = useState<Awaited<ReturnType<typeof fetchOfficialAlerts>>>([]);
  const recognitionRef = useRef<any>(null);
  const weatherRef = useRef(weather);
  const alertsRef = useRef(officialAlerts);
  const idRef = useRef(1);

  weatherRef.current = weather;
  alertsRef.current = officialAlerts;

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (e: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }
      setInterim(interimTranscript);
      if (finalTranscript) {
        handleFinal(finalTranscript);
      }
    };
    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };
    recognition.onerror = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (!weather.location) return;
    fetchOfficialAlerts(weather.location.latitude, weather.location.longitude)
      .then(setOfficialAlerts)
      .catch((error) => console.error("Official alert error:", error));
  }, [weather.location]);

  function handleFinal(text: string) {
    setInterim("");
    const userTurn: Turn = { id: idRef.current++, role: "user", text };
    setTurns((t) => [...t, userTurn]);
    const currentWeather = weatherRef.current;
    sendChatMessage(
      text,
      {
        location: currentWeather.location,
        current: currentWeather.current,
        daily: currentWeather.daily,
        airQuality: currentWeather.airQuality,
      },
      alertsRef.current
    )
      .then((reply) => {
        setTurns((t) => [...t, { id: idRef.current++, role: "bot", text: reply }]);
        speak(reply);
      })
      .catch((error) => {
        console.error("Voice chat error:", error);
        setTurns((t) => [
          ...t,
          {
            id: idRef.current++,
            role: "bot",
            text: error instanceof Error ? error.message : "The assistant is unavailable.",
          },
        ]);
      });
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  function toggleListening() {
    if (!supported || !recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        /* already started */
      }
    }
  }

  return (
    <div className="wx-fade-in flex h-full flex-col p-4 md:p-6">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Voice Assistant</h2>
        <p className="text-sm text-[color:var(--wx-text-dim)]">
          Speak naturally — ask about temperature, wind, rain, or the forecast for{" "}
          {weather.location?.city ?? "your area"}.
        </p>
      </div>

      <div className="wx-voice-shell flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="relative flex h-40 w-40 items-center justify-center">
          {listening && (
            <>
              <span className="wx-mic-ring" />
              <span className="wx-mic-ring delay" />
            </>
          )}
          <button
            onClick={toggleListening}
            disabled={!supported}
            className={`wx-mic-btn relative z-10 flex h-28 w-28 items-center justify-center rounded-full text-white shadow-2xl transition ${
              listening
                ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40"
                : "bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-500/40"
            } ${!supported ? "cursor-not-allowed opacity-40" : ""}`}
          >
            {listening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </button>
        </div>

        <p className="text-sm font-medium text-[color:var(--wx-text-dim)]">
          {!supported
            ? "Voice recognition isn't supported in this browser. Try Chrome or Edge."
            : listening
            ? "Listening... tap to stop"
            : "Tap the mic to start speaking"}
        </p>

        {interim && (
          <p className="max-w-md rounded-xl border border-[color:var(--wx-border)] bg-white/70 px-4 py-2 text-sm italic text-slate-600">
            "{interim}"
          </p>
        )}
      </div>

      <div className="wx-voice-transcript wx-scroll mt-5 max-h-64 overflow-y-auto p-4">
        {turns.length === 0 ? (
          <p className="text-center text-xs text-[color:var(--wx-text-dim)]">Your conversation will appear here</p>
        ) : (
          <div className="space-y-3">
            {turns.map((t) => (
              <div key={t.id} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex max-w-[80%] items-start gap-2 px-4 py-2.5 text-sm ${
                    t.role === "user" ? "wx-bubble-user" : "wx-bubble-bot text-slate-700"
                  }`}
                >
                  {t.role === "bot" && <Volume2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600" />}
                  {t.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}