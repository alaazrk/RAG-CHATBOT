import {
  FileText,
  FilePlus2,
  User,
  Clock,
  Sparkles,
  X,
} from "lucide-react";

import { colors } from "../config";


const ICONS = { FileText, User, Clock };

const NAV_ITEMS = [
  { id: "chat", label: "Chat", icon: "FileText" },
  { id: "resume", label: "Resume", icon: "User" },
  { id: "history", label: "History", icon: "Clock" },
];

export default function Sidebar({
    tab,
    setTab,
    fileInputRef,
    onUploadPdf,
    sidebarOpen,
    setSidebarOpen,
}){
  return (
    <aside
       className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-transform duration-300 ${
       sidebarOpen ? "translate-x-0" : "-translate-x-full"
       }`}
       style={{
         width: 300,
         backgroundColor: colors.sidebar,
       }}
    >
  
      <div
  className="flex items-center justify-between px-5 py-5"
  style={{
    borderBottom: `1px solid ${colors.sidebarBorder}`,
  }}
>
  <div className="flex items-center gap-3">
    <div
      style={{
        background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
      }}
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
    >
      <FileText size={18} color="white" strokeWidth={2} />
    </div>

    <div>
      <div className="text-white font-semibold text-[15px] leading-tight">
        PDF Assistant
      </div>

      <div
        style={{ color: colors.textFaint }}
        className="text-xs"
      >
        AI-powered analysis
      </div>
    </div>
  </div>

      <button
        onClick={() => setSidebarOpen(false)}
        className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
      >  
        <X size={18} color="white" />
      </button>

      </div>

      <div className="px-4 pt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files[0] && onUploadPdf(e.target.files[0])}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ backgroundColor: colors.sidebarActive, color: "white" }}
          className="w-full flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <FilePlus2 size={16} /> Add file
        </button>
      </div>

      <nav className="px-3 pt-4 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = tab === item.id;
          const Icon = ICONS[item.icon];
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                backgroundColor: active ? colors.sidebarActive : "transparent",
                color: active ? "white" : colors.textFaint,
              }}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} /> {item.label}
              </span>
              {active && (
                <span style={{ backgroundColor: colors.accent }} className="w-1.5 h-1.5 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      <div
        className="mt-auto px-5 py-4 flex items-center gap-2.5"
        style={{ borderTop: `1px solid ${colors.sidebarBorder}` }}
      >
        <div
          style={{ background: `linear-gradient(135deg, ${colors.accent}, #38BDF8)` }}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <Sparkles size={14} color="white" />
        </div>
        <div>
          <div className="text-white text-xs font-medium">AI Ready</div>
          <div style={{ color: colors.textFaint }} className="text-[11px]">
            Claude-powered
          </div>
        </div>
      </div>
    </aside>
  );
}