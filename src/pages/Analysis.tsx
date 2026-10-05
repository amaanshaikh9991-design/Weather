import { useState } from "react";
import { useWeather } from "../context/WeatherContext";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import AnalysisMap from "../components/AnalysisMap";
import DailyTooltip from "../components/DailyTooltip";
import HourlyTooltip from "../components/HourlyTooltip";
import {
    ThermometerSun,
    CloudRain,
    Droplets,
    Sun,
    ThermometerSnowflake,
    CloudDrizzle,
} from "lucide-react";

export default function Analysis() {
    const [selectedGraph, setSelectedGraph] = useState("temperature");
    const [selectedDailyGraph, setSelectedDailyGraph] = useState("temperature");
    const { hourly, daily, loading, location } = useWeather();

    // Highlights
    const highestTemp =
        hourly.length > 0
            ? hourly.reduce((max, item) =>
                item.temperature > max.temperature ? item : max
            )
            : null;

    const highestRain =
        hourly.length > 0
            ? hourly.reduce((max, item) =>
                item.precipitation > max.precipitation ? item : max
            )
            : null;

    const highestHumidity =
        hourly.length > 0
            ? hourly.reduce((max, item) =>
                item.humidity > max.humidity ? item : max
            )
            : null;

    const highestUV =
        hourly.length > 0
            ? hourly.reduce((max, item) =>
                item.uvIndex > max.uvIndex ? item : max
            )
            : null;

    return (
        <div className="wx-fade-in wx-scroll h-full overflow-y-auto p-6">
            {/* ================= HEADER ================= */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Weather Analysis</h1>
                <p className="text-sm text-[color:var(--wx-text-dim)]">
                    Analyze hourly and daily weather trends for your selected location.
                </p>
            </div>

            {/* 60% GRAPH + 40% MAP */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-8">

                {/* ================= LEFT : GRAPH ================= */}
                <div className="xl:col-span-3 wx-panel p-5 rounded-2xl">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-white">
                            24-Hour Weather Trend
                        </h2>

                        <p className="text-sm text-gray-400">
                            Live hourly forecast for {location?.city || "your location"}.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-3 flex-wrap mb-5">
                        {["temperature", "rainfall", "humidity", "uv"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedGraph(type)}
                                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${selectedGraph === type
                                    ? "bg-cyan-500/90 text-white shadow-md shadow-cyan-500/20"
                                    : "bg-[#132B49] text-gray-300 hover:bg-[#1A3B61]"
                                    }`}
                            >
                                {type === "temperature" && (
                                    <div className="flex items-center gap-2">
                                        <ThermometerSun className="h-5 w-5 text-cyan-400" strokeWidth={2.3} />
                                        <span>Temperature</span>
                                    </div>
                                )}

                                {type === "rainfall" && (
                                    <div className="flex items-center gap-2">
                                        <CloudRain className="h-5 w-5 text-blue-400" strokeWidth={2.3} />
                                        <span>Rainfall</span>
                                    </div>
                                )}

                                {type === "humidity" && (
                                    <div className="flex items-center gap-2">
                                        <Droplets className="h-5 w-5 text-emerald-400" strokeWidth={2.3} />
                                        <span>Humidity</span>
                                    </div>
                                )}

                                {type === "uv" && (
                                    <div className="flex items-center gap-2">
                                        <Sun className="h-5 w-5 text-yellow-400" strokeWidth={2.3} />
                                        <span>UV Index</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="h-80 rounded-2xl bg-[#081626] p-4">
                        {loading ? (
                            <p className="text-center text-gray-400 mt-24">
                                Loading hourly weather...
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={hourly}>
                                    <CartesianGrid
                                        stroke="#1F3755"
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="time"
                                        tickFormatter={(time) => String(time).slice(11, 16)}
                                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        cursor={{ stroke: "#22D3EE", strokeWidth: 1 }}
                                        content={(props) => (
                                            <HourlyTooltip {...props} selectedGraph={selectedGraph} />
                                        )}
                                    />

                                    {/* Temperature */}
                                    {selectedGraph === "temperature" && (
                                        <Line
                                            type="monotone"
                                            dataKey="temperature"
                                            stroke="#22D3EE"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    )}

                                    {/* Rainfall */}
                                    {selectedGraph === "rainfall" && (
                                        <Line
                                            type="monotone"
                                            dataKey="precipitation"
                                            stroke="#3B82F6"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    )}

                                    {/* Humidity */}
                                    {selectedGraph === "humidity" && (
                                        <Line
                                            type="monotone"
                                            dataKey="humidity"
                                            stroke="#34D399"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    )}

                                    {/* UV Index */}
                                    {selectedGraph === "uv" && (
                                        <Line
                                            type="monotone"
                                            dataKey="uvIndex"
                                            stroke="#FBBF24"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ================= RIGHT : MAP ================= */}
                <div className="xl:col-span-2 wx-panel p-5 rounded-2xl">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-white">
                            Live Weather Map
                        </h2>

                        <p className="text-sm text-gray-400">
                            Weather layer for {location?.city || "selected location"}.
                        </p>
                    </div>

                    {/* Layer Buttons */}
                    {/* Active Layer */}
                    <div className="mb-4">
                        <div className="mt-2 inline-flex rounded-full bg-[#132B49] px-3 py-2 text-cyan-400 text-sm font-medium">
                            {selectedGraph === "temperature" && (
                                <div className="flex items-center gap-2">
                                    <ThermometerSnowflake className="h-4 w-4" />
                                    <span>Temperature</span>
                                </div>
                            )}

                            {selectedGraph === "rainfall" && (
                                <div className="flex items-center gap-2">
                                    <CloudDrizzle className="h-4 w-4" />
                                    <span>Rainfall</span>
                                </div>
                            )}

                            {selectedGraph === "humidity" && (
                                <div className="flex items-center gap-2">
                                    <Droplets className="h-4 w-4" />
                                    <span>Humidity</span>
                                </div>
                            )}

                            {selectedGraph === "uv" && (
                                <div className="flex items-center gap-2">
                                    <Sun className="h-4 w-4" />
                                    <span>UV Index</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Placeholder */}
                    <div className="h-80 rounded-2xl overflow-hidden border border-[#1F3755]">
                        <AnalysisMap layer={selectedGraph} />
                    </div>
                </div>
            </div>

            {/* DAILY WEATHER TREND */}
            {/* ================= DAILY WEATHER TREND ================= */}
            <div className="wx-panel mt-6 p-5 rounded-2xl">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-white">
                        8-Day Weather Trend
                    </h2>
                    <p className="text-sm text-gray-400">
                        Daily forecast for {location?.city || "your location"}.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-5 flex-wrap">
                    {["temperature", "rainfall", "humidity", "uv"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedDailyGraph(type)}
                            className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${selectedDailyGraph === type
                                    ? "bg-cyan-500/90 text-white shadow-md shadow-cyan-500/20"
                                    : "bg-[#132B49] text-gray-300 hover:bg-[#1A3B61]"
                                }`}
                        >
                            {type === "temperature" && (
                                <div className="flex items-center gap-2">
                                    <ThermometerSun className="h-5 w-5 text-cyan-400" strokeWidth={2.3} />
                                    <span>Temperature</span>
                                </div>
                            )}

                            {type === "rainfall" && (
                                <div className="flex items-center gap-2">
                                    <CloudRain className="h-5 w-5 text-blue-400" strokeWidth={2.3} />
                                    <span>Rainfall</span>
                                </div>
                            )}

                            {type === "humidity" && (
                                <div className="flex items-center gap-2">
                                    <Droplets className="h-5 w-5 text-emerald-400" strokeWidth={2.3} />
                                    <span>Humidity</span>
                                </div>
                            )}

                            {type === "uv" && (
                                <div className="flex items-center gap-2">
                                    <Sun className="h-5 w-5 text-yellow-400" strokeWidth={2.3} />
                                    <span>UV Index</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Bar Chart */}
                <div className="h-80 rounded-2xl bg-[#081626] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={daily}>
                            <CartesianGrid stroke="#1F3755" strokeDasharray="3 3" />

                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => date.slice(5)}
                                tick={{ fill: "#94A3B8", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <YAxis
                                tick={{ fill: "#94A3B8", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                content={(props) => (
                                    <DailyTooltip
                                        {...props}
                                        selectedDailyGraph={selectedDailyGraph}
                                    />
                                )}
                            />

                            {selectedDailyGraph === "temperature" && (
                                <Bar
                                    dataKey="tempMax"
                                    fill="#22D3EE"
                                    radius={[10, 10, 0, 0]}
                                    barSize={38}
                                />
                            )}

                            {selectedDailyGraph === "rainfall" && (
                                <Bar
                                    dataKey="precipitation"
                                    fill="#3B82F6"
                                    radius={[10, 10, 0, 0]}
                                    barSize={38}
                                />
                            )}

                            {selectedDailyGraph === "humidity" && (
                                <Bar
                                    dataKey="humidity"
                                    fill="#34D399"
                                    radius={[10, 10, 0, 0]}
                                    barSize={38}
                                />
                            )}

                            {selectedDailyGraph === "uv" && (
                                <Bar
                                    dataKey="uvIndexMax"
                                    fill="#FBBF24"
                                    radius={[10, 10, 0, 0]}
                                    barSize={38}
                                />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {/* ================= WEATHER HIGHLIGHTS ================= */}
            <div className="wx-panel mt-6 p-5 rounded-2xl">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-white">
                        Today's Weather Highlights
                    </h2>
                    <p className="text-sm text-gray-400">
                        Peak weather conditions in the next 24 hours.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Highest Temperature */}
                    <div className="rounded-2xl bg-[#0C2238] border border-cyan-500/20 p-5 hover:border-cyan-400/40 transition">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-400">Highest Temperature</span>
                            <ThermometerSun className="h-9 w-9 text-cyan-400" />
                        </div>

                        <h3 className="text-4xl font-bold text-cyan-400">
                            {highestTemp?.temperature ?? "--"}°C
                        </h3>

                        <p className="text-sm text-gray-400 mt-2">
                            Today • {highestTemp?.time?.slice(11, 16)}
                        </p>
                    </div>

                    {/* Peak Rainfall */}
                    <div className="rounded-2xl bg-[#0C2238] border border-blue-500/20 p-5 hover:border-blue-400/40 transition">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-400">Peak Rainfall</span>
                            <CloudRain className="h-9 w-9 text-blue-400" />
                        </div>

                        <h3 className="text-4xl font-bold text-blue-400">
                            {highestRain?.precipitation ?? "--"} mm
                        </h3>

                        <p className="text-sm text-gray-400 mt-2">
                            Today • {highestRain?.time?.slice(11, 16)}
                        </p>
                    </div>

                    {/* Highest Humidity */}
                    <div className="rounded-2xl bg-[#0C2238] border border-green-500/20 p-5 hover:border-green-400/40 transition">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-400">Highest Humidity</span>
                            <Droplets className="h-9 w-9 text-green-400" />
                        </div>

                        <h3 className="text-4xl font-bold text-green-400">
                            {highestHumidity?.humidity ?? "--"}%
                        </h3>

                        <p className="text-sm text-gray-400 mt-2">
                            Today • {highestHumidity?.time?.slice(11, 16)}
                        </p>
                    </div>

                    {/* Peak UV Index */}
                    <div className="rounded-2xl bg-[#0C2238] border border-yellow-500/20 p-5 hover:border-yellow-400/40 transition">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-400">Peak UV Index</span>
                            <Sun className="h-9 w-9 text-yellow-400" />
                        </div>

                        <h3 className="text-4xl font-bold text-yellow-400">
                            {highestUV?.uvIndex ?? "--"}
                        </h3>

                        <p className="text-sm text-gray-400 mt-2">
                            Today • {highestUV?.time?.slice(11, 16)}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}