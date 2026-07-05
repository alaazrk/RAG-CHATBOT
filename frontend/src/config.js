// ============================================================
// CONFIGURATION — backend FastAPI (AI RAG Chatbot)
// ============================================================

export const colors = {
  // Fond principal
  bgApp: "#08080F",

  // Cartes / panneaux
  bgPanel: "#0F0F1A",
  bgPanelHover: "#1A1A2E",

  // Bordures
  border: "rgba(255,255,255,0.07)",

  // Couleurs principales
  accent: "#7C5CFC",
  accentHover: "#6D4CE0",
  accentSoft: "rgba(124,92,252,0.15)",

  // Accent secondaire (bleu)
  accentBlue: "#5B8AF0",

  // Texte
  textPrimary: "#E8E8F0",
  textSecondary: "#C0BFE8",
  textFaint: "#6B6A8F",
  textLink: "#7C5CFC",

  // Etats
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  danger: "#EF4444",

  // Sidebar
  sidebar: "#0C0C18",
  sidebarBorder: "rgba(255,255,255,0.06)",
};


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