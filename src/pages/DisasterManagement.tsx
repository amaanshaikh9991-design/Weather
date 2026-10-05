import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {
  disasterData,
  type DisasterType,
} from "../lib/disasterData";

import type { DisasterAlert } from "../types/disaster";
import { useWeather } from "../context/WeatherContext";
import { fetchOfficialAlerts } from "../services/alertsApi";

// ============================================================
// DEFAULT MAP LOCATION
// ============================================================

const DEFAULT_LOCATION: [number, number] = [0, 0];

// ============================================================
// LOCATION SEARCH RESULT
// ============================================================

interface LocationResult {
  lat: string;
  lon: string;
  display_name: string;
}

// ============================================================
// MAP CONTROLLER
// ============================================================

function MapController({
  location,
}: {
  location: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(location, 10, {
      duration: 1.5,
    });
  }, [location, map]);

  return null;
}

// ============================================================
// DISASTER MANAGEMENT
// ============================================================

export default function DisasterManagement() {
  const { location, selectLocation } = useWeather();
  // ==========================================================
  // SELECTED DISASTER
  // ==========================================================

  const [selectedDisaster, setSelectedDisaster] =
    useState<DisasterType>("flood");

  const disaster = disasterData[selectedDisaster];

  // ==========================================================
  // VERIFIED DISASTER ALERTS
  // ==========================================================
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState("");

  // ==========================================================
  // LOCATION SEARCH
  // ==========================================================

  const [searchQuery, setSearchQuery] = useState("");

  const [mapLocation, setMapLocation] =
    useState<[number, number]>(DEFAULT_LOCATION);

  const [locationName, setLocationName] =
    useState("Your location");

  const [searching, setSearching] = useState(false);

  const [locating, setLocating] = useState(false);

  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (!location) return;
    setMapLocation([location.latitude, location.longitude]);
    setLocationName(`${location.city}, ${location.region}`);
  }, [location]);

  useEffect(() => {
    let cancelled = false;
    setAlertsLoading(true);
    setAlertsError("");
    fetchOfficialAlerts(mapLocation[0], mapLocation[1])
      .then((nextAlerts) => {
        if (!cancelled) setAlerts(nextAlerts);
      })
      .catch((error) => {
        console.error("Official disaster alert error:", error);
        if (!cancelled) setAlertsError("Official alert data is temporarily unavailable.");
      })
      .finally(() => {
        if (!cancelled) setAlertsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mapLocation]);

  // ==========================================================
  // SEARCH LOCATION
  // ==========================================================

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const data: LocationResult[] =
        await response.json();

      if (data.length === 0) {
        setSearchError(
          "Location not found. Try another place."
        );
        return;
      }

      const result = data[0];

      const latitude = Number(result.lat);
      const longitude = Number(result.lon);

      setMapLocation([
        latitude,
        longitude,
      ]);

      setLocationName(result.display_name);
      selectLocation(latitude, longitude);
    } catch (error) {
      console.error(
        "Location search error:",
        error
      );

      setSearchError(
        "Unable to search this location. Please try again."
      );
    } finally {
      setSearching(false);
    }
  };

  // ==========================================================
  // GET USER'S CURRENT LOCATION
  // ==========================================================

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      setSearchError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocating(true);
    setSearchError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
        } = position.coords;

        setMapLocation([
          latitude,
          longitude,
        ]);

        setLocationName(
          "Your Current Location"
        );

        setSearchQuery("");
        selectLocation(latitude, longitude);
        setLocating(false);
      },

      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        let message =
          "Unable to access your location.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        }

        if (error.code === 2) {
          message =
            "Your location could not be determined. Please try again.";
        }

        if (error.code === 3) {
          message =
            "Location request timed out. Please try again.";
        }

        setSearchError(message);
        setLocating(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="w-full min-h-full text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="mb-8">

        <div className="flex items-center gap-3 mb-3">

          <span className="text-3xl">
            🚨
          </span>

          <div>

            <p className="text-cyan-400 text-sm font-semibold tracking-widest">
              WEATHERGPT
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">
              Disaster Management
            </h1>

          </div>

        </div>

        <p className="text-slate-400 max-w-3xl">
          Stay informed, prepare for emergencies,
          and understand what to do before, during,
          and after a disaster.
        </p>

      </section>


      {/* =====================================================
          ACTIVE ALERTS
      ===================================================== */}

      <section className="mb-8">

        <div className="flex items-center justify-between mb-4">

          <div>

            <h2 className="text-xl font-bold">
              Active Alerts
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Official alerts for {locationName}. Forecast advisories are shown separately in Weather Alerts.
            </p>

          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">

            <span className="w-2 h-2 rounded-full bg-green-400"></span>

            {alertsLoading ? "Checking official feeds..." : "Monitoring official feeds"}

          </div>

        </div>

        {alertsError ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-sm text-amber-200">
            {alertsError}
          </div>
        ) : alerts.length === 0 ? (

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl">
                ✓
              </div>

              <div>

                <h3 className="font-semibold text-lg">
                  No verified active disaster alerts
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  When an official warning is available,
                  it will be displayed here with its
                  location, severity, and source.
                </p>

              </div>

            </div>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {alerts.map((alert) => (

              <div
                key={alert.id}
                className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5"
              >

                <div className="flex items-start gap-3">

                  <div className="text-2xl">🚨</div>

                  <div className="min-w-0">

                    <h3 className="font-semibold text-lg">
                      {alert.title}
                    </h3>

                    <p className="text-sm text-slate-300 mt-1">
                      {alert.type} • {alert.severity}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      {alert.affectedArea}
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      Source: {alert.source}
                    </p>
                    {alert.description && (
                      <p className="text-sm text-slate-300 mt-3">
                        {alert.description.slice(0, 500)}
                      </p>
                    )}
                    {alert.sourceUrl && (
                      <a
                        href={alert.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-xs text-cyan-300 underline"
                      >
                        Open official source
                      </a>
                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          DISASTER TYPES
      ===================================================== */}

      <section className="mb-8">

        <div className="mb-4">

          <h2 className="text-xl font-bold">
            Disaster Preparedness
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Select a disaster to view preparedness
            and response information.
          </p>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {(Object.keys(disasterData) as DisasterType[]).map(
            (type) => {

              const item = disasterData[type];

              const isSelected =
                selectedDisaster === type;

              return (

                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setSelectedDisaster(type)
                  }
                  className={`
                    group
                    text-left
                    rounded-2xl
                    border
                    p-5
                    transition-all
                    duration-300
                    ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_25px_rgba(34,211,238,0.12)]"
                        : "border-white/10 bg-slate-900/50 hover:border-cyan-400/40 hover:bg-slate-800/70"
                    }
                  `}
                >

                  <div className="text-3xl mb-3">
                    {item.icon}
                  </div>

                  <h3 className="font-semibold">
                    {item.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {item.shortDescription}
                  </p>

                </button>

              );
            }
          )}

        </div>

      </section>


      {/* =====================================================
          SELECTED DISASTER
      ===================================================== */}

      <section className="mb-8">

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">

          <div className="p-6 border-b border-white/10">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-3xl">
                {disaster.icon}
              </div>

              <div>

                <p className="text-xs text-cyan-400 uppercase tracking-widest font-semibold">
                  Disaster Information
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  {disaster.name}
                </h2>

              </div>

            </div>

            <p className="text-slate-400 mt-4 max-w-4xl">
              {disaster.overview}
            </p>

          </div>


          {/* BEFORE / DURING / AFTER */}

          <div className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* BEFORE */}

              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    🛡️
                  </div>

                  <div>

                    <h3 className="font-semibold">
                      Before
                    </h3>

                    <p className="text-xs text-slate-500">
                      Prepare
                    </p>

                  </div>

                </div>

                <ul className="space-y-3">

                  {disaster.before.map(
                    (item, index) => (

                      <li
                        key={index}
                        className="flex gap-3 text-sm text-slate-300"
                      >

                        <span className="text-cyan-400">
                          ✓
                        </span>

                        <span>
                          {item}
                        </span>

                      </li>

                    )
                  )}

                </ul>

              </div>


              {/* DURING */}

              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    ⚡
                  </div>

                  <div>

                    <h3 className="font-semibold">
                      During
                    </h3>

                    <p className="text-xs text-slate-500">
                      Stay Safe
                    </p>

                  </div>

                </div>

                <ul className="space-y-3">

                  {disaster.during.map(
                    (item, index) => (

                      <li
                        key={index}
                        className="flex gap-3 text-sm text-slate-300"
                      >

                        <span className="text-orange-400">
                          ✓
                        </span>

                        <span>
                          {item}
                        </span>

                      </li>

                    )
                  )}

                </ul>

              </div>


              {/* AFTER */}

              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    🏠
                  </div>

                  <div>

                    <h3 className="font-semibold">
                      After
                    </h3>

                    <p className="text-xs text-slate-500">
                      Recover
                    </p>

                  </div>

                </div>

                <ul className="space-y-3">

                  {disaster.after.map(
                    (item, index) => (

                      <li
                        key={index}
                        className="flex gap-3 text-sm text-slate-300"
                      >

                        <span className="text-green-400">
                          ✓
                        </span>

                        <span>
                          {item}
                        </span>

                      </li>

                    )
                  )}

                </ul>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          LEAFLET MAP
      ===================================================== */}

      <section className="mb-8">

        <div className="mb-4">

          <h2 className="text-xl font-bold">
            🗺️ Disaster Risk Map
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Search any location or use your current
            location to explore the map.
          </p>

        </div>


        {/* SEARCH + CURRENT LOCATION */}

        <div className="mb-4">

          <div className="flex flex-col sm:flex-row gap-2">

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              onKeyDown={(event) => {

                if (event.key === "Enter") {
                  searchLocation();
                }

              }}
              placeholder="🔍 Search any location..."
              className="
                flex-1
                rounded-xl
                border
                border-white/10
                bg-slate-900/80
                px-4
                py-3
                text-sm
                text-white
                outline-none
                placeholder:text-slate-500
                focus:border-cyan-400
                focus:ring-1
                focus:ring-cyan-400
              "
            />

            <button
              type="button"
              onClick={searchLocation}
              disabled={
                searching ||
                !searchQuery.trim()
              }
              className="
                rounded-xl
                bg-cyan-500
                px-6
                py-3
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-cyan-400
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {searching
                ? "Searching..."
                : "Search"}

            </button>

            <button
              type="button"
              onClick={getMyLocation}
              disabled={locating}
              className="
                rounded-xl
                border
                border-cyan-400/30
                bg-cyan-400/10
                px-5
                py-3
                text-sm
                font-semibold
                text-cyan-300
                transition
                hover:bg-cyan-400/20
                hover:border-cyan-400/60
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {locating
                ? "Locating..."
                : "📍 My Location"}

            </button>

          </div>


          {/* ERROR */}

          {searchError && (

            <p className="mt-2 text-sm text-red-400">
              {searchError}
            </p>

          )}


          {/* LOCATION NAME */}

          {!searchError && (

            <p className="mt-2 text-xs text-slate-500 truncate">
              Showing: {locationName}
            </p>

          )}

        </div>


        {/* LEAFLET MAP */}

        <div
          className="
            w-full
            h-[450px]
            rounded-2xl
            border
            border-white/10
            overflow-hidden
          "
        >

          <MapContainer
            center={mapLocation}
            zoom={5}
            scrollWheelZoom={true}
            className="w-full h-full"
          >

            <MapController
              location={mapLocation}
            />

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Selected Location Marker */}

            <Marker
              position={mapLocation}
            >

              <Popup>

                <div>

                  <strong>
                    {locationName}
                  </strong>

                  <br />

                  WeatherGPT Disaster Map

                  <br />

                  <span>
                    Location selected for disaster monitoring.
                  </span>

                </div>

              </Popup>

            </Marker>


            {/* Verified Disaster Alert Markers */}

            {alerts.map((alert) => (

              <Marker
                key={alert.id}
                position={[
                  alert.latitude,
                  alert.longitude,
                ]}
              >

                <Popup>

                  <div>

                    <strong>
                      {alert.title}
                    </strong>

                    <br />

                    Disaster: {alert.type}

                    <br />

                    Severity: {alert.severity}

                    <br />

                    Area: {alert.affectedArea}

                    <br />

                    Source: {alert.source}

                    <br />

                    Issued: {alert.issuedAt}

                  </div>

                </Popup>

              </Marker>

            ))}

          </MapContainer>

        </div>

      </section>


      {/* =====================================================
          IMPORTANT ACTIONS
      ===================================================== */}

      <section className="mb-8">

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="text-2xl">
              🚨
            </div>

            <div>

              <h2 className="text-xl font-bold">
                Important Actions
              </h2>

              <p className="text-sm text-slate-400">
                Key actions for{" "}
                {disaster.name.toLowerCase()} situations.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {disaster.importantActions.map(
              (action, index) => (

                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4"
                >

                  <div className="w-7 h-7 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400 text-sm">
                    {index + 1}
                  </div>

                  <span className="text-sm text-slate-300">
                    {action}
                  </span>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      <section className="mb-8">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Emergency contacts</h2>
              <p className="mt-1 text-sm text-slate-400">
                India-wide emergency numbers. Call 112 first when life or property is in immediate danger.
              </p>
            </div>
            <span className="rounded-full bg-red-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">
              Keep accessible
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["112", "Unified emergency response", "Police, fire, ambulance"],
              ["108", "Ambulance", "Medical emergency and rescue"],
              ["101", "Fire and rescue", "Fire, rescue and flood response"],
              ["100", "Police", "Immediate police assistance"],
              ["1078", "National Disaster Management", "NDMA disaster helpline"],
              ["1070", "State emergency operations", "Relief commissioner / state control room"],
              ["1077", "District disaster control room", "Local district emergency coordination"],
              ["1098", "Child Helpline", "Children in danger or needing help"],
              ["181", "Women Helpline", "Women’s emergency support"],
              ["1554", "Indian Coast Guard", "Coastal and maritime emergencies"],
            ].map(([number, title, detail]) => (
              <a
                key={number}
                href={`tel:${number}`}
                className="group rounded-xl border border-white/10 bg-slate-950/40 p-4 transition hover:-translate-y-0.5 hover:border-red-300/40 hover:bg-red-400/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{number}</span>
                  <span className="text-xs text-red-300">Call</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-200">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{detail}</p>
              </a>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
            Sources: Government of India ERSS 112 and NDMA helpline information. Number availability can vary by state; follow local authority instructions.
          </p>
        </div>
      </section>

      {/* =====================================================
          EMERGENCY KIT
      ===================================================== */}

      <section className="pb-8">

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="text-2xl">
              🎒
            </div>

            <div>

              <h2 className="text-xl font-bold">
                Emergency Kit
              </h2>

              <p className="text-sm text-slate-400">
                Recommended items to keep prepared.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {disaster.emergencyKit.map(
              (item, index) => (

                <div
                  key={index}
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-950/40
                    p-4
                    text-sm
                    text-slate-300
                    hover:border-cyan-400/30
                    transition
                  "
                >

                  <span className="text-cyan-400 mr-2">
                    ✓
                  </span>

                  {item}

                </div>

              )
            )}

          </div>

        </div>

      </section>

    </div>
  );
}
