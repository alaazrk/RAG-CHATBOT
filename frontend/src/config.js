// ============================================================
// CONFIGURATION — backend FastAPI (AI RAG Chatbot)
// ============================================================
// POST   /upload/            (multipart, champ "file") -> { success, filename, chunks }
// POST   /chat/               (json: { question })       -> { answer, sources: [filename, ...] }
// GET    /documents/                                      -> { count, documents: [{name, size}] }
// DELETE /documents/{filename}                            -> { success, message }
// GET    /health/                                         -> { status, api, rag }
export const API_BASE = "http://localhost:8000";

export const colors = {
  sidebar: "#04191e",
  sidebarActive: "#1B2456",
  sidebarBorder: "#232C57",
  bgGradTop: "#EEF2FC",
  bgGradBottom: "#C9D6F5",
  bubble: "#FFFFFF",
  accent: "#626bba",
  accentDark: "#343e8b",
  text: "#1A1F36",
  textSoft: "#6B7280",
  textFaint: "#9AA3C9",
};


export const NAV_ITEMS_CONFIG = [
  { id: "chat", label: "Chat", icon: "FileText" },
  { id: "resume", label: "Resume", icon: "User" },
  { id: "history", label: "History", icon: "Clock" },
];

export function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}