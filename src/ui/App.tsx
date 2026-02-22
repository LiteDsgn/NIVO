import { MemoryRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import { MessageSquare, Settings as SettingsIcon } from "lucide-react";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-figma-bg text-figma-text font-sans text-figma-11">
        {/* Segmented Tab Bar */}
        <div className="flex items-center gap-0.5 p-1.5 bg-figma-bg border-b border-figma-border shrink-0">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-figma-11 font-medium transition-all duration-150 ${isActive
                ? "bg-figma-bg-hover text-figma-text shadow-sm border border-figma-border"
                : "text-figma-text-secondary hover:text-figma-text hover:bg-figma-bg-hover/50 border border-transparent"
              }`
            }
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Copilot</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-figma-11 font-medium transition-all duration-150 ${isActive
                ? "bg-figma-bg-hover text-figma-text shadow-sm border border-figma-border"
                : "text-figma-text-secondary hover:text-figma-text hover:bg-figma-bg-hover/50 border border-transparent"
              }`
            }
          >
            <SettingsIcon className="h-3.5 w-3.5" />
            <span>Settings</span>
          </NavLink>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}