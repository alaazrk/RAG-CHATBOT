// ============================================================
// CONFIGURATION — backend FastAPI (AI RAG Chatbot)
// ============================================================

export const API_BASE = "http://localhost:8000";

/* =======================
   Couleurs de l'application
======================= */

export const colors = {
  bgApp: "#0A0A0E",
  bgPanel: "#15151D",
  bgPanelHover: "#1C1C26",

  border: "#232330",

  accent: "#7C5CFC",
  accentHover: "#6D4CE0",
  accentSoft: "rgba(124, 92, 252, 0.15)",

  textPrimary: "#F2F2F5",
  textSecondary: "#9C9CAB",
  textFaint: "#6B6B7B",
  textLink: "#A78BFA",

  danger: "#F87171",

  // ✅ Couleurs Quiz
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
};

/* =======================
   Navigation principale
======================= */

export const TABS = [
  {
    id: "chat",
    label: "Chat",
  },
  {
    id: "resume",
    label: "Résumé",
  },
  {
    id: "quiz",
    label: "Quiz",
  },
];

/* =======================
   Utilitaires
======================= */

export function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSize(kb) {
  if (kb == null) return "";

  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  return `${Math.round(kb)} KB`;
}