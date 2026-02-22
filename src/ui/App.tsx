import { MemoryRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import { MessageSquare, Settings as SettingsIcon } from "lucide-react";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-figma-bg text-figma-text font-sans text-figma-11">
        {/* Header */}
        <div className="flex items-center justify-center h-9 shrink-0 border-b border-figma-border bg-figma-bg relative">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-figma-bg-brand flex items-center justify-center">
              <span className="text-[8px] font-bold text-figma-text-onbrand leading-none">N</span>
            </div>
            <span className="font-semibold text-figma-11 text-figma-text">Nivo</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center border-t border-figma-border bg-figma-bg shrink-0">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors border-t-2 -mt-[1px] ${isActive
                ? "border-figma-border-brand text-figma-text-brand"
                : "border-transparent text-figma-text-secondary hover:text-figma-text"
              }`
            }
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-figma-11 font-medium">Chat</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors border-t-2 -mt-[1px] ${isActive
                ? "border-figma-border-brand text-figma-text-brand"
                : "border-transparent text-figma-text-secondary hover:text-figma-text"
              }`
            }
          >
            <SettingsIcon className="h-3.5 w-3.5" />
            <span className="text-figma-11 font-medium">Settings</span>
          </NavLink>
        </div>
      </div>
    </Router>
  );
}