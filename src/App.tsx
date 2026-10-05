import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./styles/dashboard.css";

import { WeatherProvider } from "./context/WeatherContext";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import type { PageKey } from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Advisory from "./pages/Advisory";
import DisasterManagement from "./pages/DisasterManagement";
import Alerts from "./pages/Alerts";
import Forecast from "./pages/Forecast";
import Analysis from "./pages/Analysis";
import Map from "./pages/Map";
import Voice from "./pages/Voice";

import Landing from "./pages/Landing";
import DynamicBackground from "./components/DynamicBackground";

function WeatherApp() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <WeatherProvider>
      <DynamicBackground />

      <div className="relative flex h-screen w-full overflow-hidden text-slate-900 selection:bg-cyan-500/30 selection:text-cyan-900 text-[15px]">

        {/* Sidebar */}
        <Sidebar
          active={page}
          onChange={(nextPage) => {
            setPage(nextPage);
            setSidebarOpen(false);
          }}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((open) => !open)}
        />

        {/* Main Content */}
        <div className="relative z-10 flex min-w-0 flex-1 flex-col">

          <Header
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
          />

          <main className="relative min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

            {page === "dashboard" && <Dashboard />}

            {page === "chat" && <Chat />}

            {page === "advisory" && <Advisory />}

            {page === "disaster" && <DisasterManagement />}

            {page === "alerts" && <Alerts />}

            {page === "forecast" && <Forecast />}

            {page === "analysis" && <Analysis />}

            {page === "map" && <Map />}

            {page === "voice" && <Voice />}

          </main>

        </div>

      </div>
    </WeatherProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Landing Page */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* Main WeatherGPT Application */}
        <Route
          path="/dashboard"
          element={<WeatherApp />}
        />

        {/* Unknown URL → Landing Page */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}