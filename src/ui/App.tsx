import { MemoryRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import { MessageSquare, Settings as SettingsIcon } from "lucide-react";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-figma-bg text-figma-text font-sans text-figma-11">
        {/* Header - Figma Native Plugin Header Style */}
        <div className="flex items-center justify-center border-b border-figma-border h-10 shrink-0 relative bg-figma-bg">
          <span className="font-semibold text-figma-11 text-figma-text">Nivo Copilot</span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden bg-figma-bg">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

        {/* Tab Bar - Figma Native Segmented Control Style */}
        <div className="flex items-center gap-1 border-t border-figma-border bg-figma-bg p-2 shrink-0">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-2 py-1.5 rounded-figma-6 transition-colors ${isActive
                ? "bg-figma-bg-selected text-figma-text-brand shadow-sm font-medium"
                : "text-figma-text hover:bg-figma-bg-hover"
              }`
            }
          >
            <MessageSquare className="h-[14px] w-[14px]" />
            <span className="text-figma-11">Chat</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex-1 flex items-center justify-center gap-2 py-1.5 rounded-figma-6 transition-colors ${isActive
                ? "bg-figma-bg-selected text-figma-text-brand shadow-sm font-medium"
                : "text-figma-text hover:bg-figma-bg-hover"
              }`
            }
          >
            <SettingsIcon className="h-[14px] w-[14px]" />
            <span className="text-figma-11">Settings</span>
          </NavLink>
        </div>
      </div>
    </Router>
  );
}