import {
    ThermometerSun,
    CloudRain,
    Droplets,
    SunMedium,
} from "lucide-react";

interface DailyTooltipProps {
    active?: boolean;
    payload?: readonly any[];
    label?: string | number;
    selectedDailyGraph: string;
}

export default function DailyTooltip({
    active,
    payload,
    label,
    selectedDailyGraph,
}: DailyTooltipProps) {
    if (!active || !payload || !payload.length) return null;

    const value = payload[0].value;

    const config = {
        temperature: {
            icon: <ThermometerSun size={24} color="#22D3EE" />,
            title: "Temperature",
            color: "#22D3EE",
            value: `${value}°C`,
            badge:
                value >= 35 ? "Very Hot" :
                    value >= 30 ? "Hot" :
                        value >= 25 ? "Pleasant" : "Cool",
        },
        rainfall: {
            icon: <CloudRain size={24} color="#3B82F6" />,
            title: "Rainfall",
            color: "#3B82F6",
            value: `${value} mm`,
            badge:
                value >= 10 ? "Heavy Rain" :
                    value >= 5 ? "Moderate Rain" :
                        value > 0 ? "Light Rain" : "No Rain",
        },
        humidity: {
            icon: <Droplets size={24} color="#34D399" />,
            title: "Humidity",
            color: "#34D399",
            value: `${value}%`,
            badge:
                value >= 85 ? "Very Humid" :
                    value >= 70 ? "Humid" :
                        value >= 50 ? "Comfortable" : "Dry",
        },
        uv: {
            icon: <SunMedium size={24} color="#FBBF24" />,
            title: "UV Index",
            color: "#FBBF24",
            value,
            badge:
                value >= 8 ? "Very High" :
                    value >= 6 ? "High Exposure" :
                        value >= 3 ? "Moderate" : "Low UV",
        },
    };

    const current = config[selectedDailyGraph as keyof typeof config];

    return (
        <div
            style={{
                background: "#071625",
                border: `1px solid ${current.color}`,
                borderRadius: "16px",
                padding: "10px 12px",
                minWidth: "150px",
                boxShadow: `0 0 18px ${current.color}20`,
            }}
        >
            <div
                style={{
                    color: "#CBD5E1",
                    fontSize: "12px",
                    fontWeight: 600,
                    marginBottom: "8px",
                }}
            >
                📅{" "}
                {new Date(String(label ?? "")).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </div>

            <div
                style={{
                    height: "1px",
                    background: "#18324A",
                    marginBottom: "10px",
                }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: "12px",
                        background: `${current.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {current.icon}
                </div>

                <div>
                    <div style={{ color: "#8FB5D8", fontSize: "12px" }}>
                        {current.title}
                    </div>

                    <div
                        style={{
                            color: current.color,
                            fontSize: "22px",
                            fontWeight: 700,
                            lineHeight: 1.05,
                        }}
                    >
                        {current.value}
                    </div>
                </div>
            </div>

            <div
                style={{
                    marginTop: "10px",
                    display: "inline-block",
                    background: `${current.color}20`,
                    color: current.color,
                    padding: "4px 8px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 600,
                }}
            >
                {current.badge}
            </div>
        </div>
    );
}