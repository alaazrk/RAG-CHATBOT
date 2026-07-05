import { useState } from "react";
import { FileText, Clock, ChevronDown, Trash2 } from "lucide-react";
import { colors } from "../config";
import MarkdownText from "./MarkdownText";

export default function HistoryView({ history, onClearHistory }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-6 pt-6 pb-4 bg-white/30 flex items-center justify-between">
        <div>
          <h1 style={{ color: colors.text }} className="text-2xl font-bold">
            Chat History
          </h1>
          <p style={{ color: colors.textSoft }} className="text-sm mt-1">
            Clique sur une question pour revoir la réponse complète.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Effacer tout l'historique des conversations ?")) {
                onClearHistory();
              }
            }}
            style={{ color: colors.textFaint }}
            className="flex items-center gap-1.5 text-xs hover:opacity-70"
          >
            <Trash2 size={13} /> Tout effacer
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {history.length === 0 && (
          <p style={{ color: colors.textSoft }} className="text-sm italic">
            Aucune conversation pour l'instant. Pose une question dans l'onglet Chat.
          </p>
        )}
        {history.map((h, i) => {
          const isOpen = expandedIndex === i;
          return (
            <div
              key={i}
              style={{ backgroundColor: colors.bubble }}
              className="rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isOpen ? null : i)}
                className="w-full text-left px-5 py-4 flex items-start gap-3"
              >
                <div
                  style={{ backgroundColor: "rgba(59,76,224,0.12)" }}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <FileText size={16} color={colors.accent} />
                </div>
                <div className="min-w-0 flex-1">
                  <div style={{ color: colors.text }} className="font-semibold text-sm truncate">
                    {h.filename}
                  </div>
                  <div style={{ color: colors.textSoft }} className="text-sm mt-0.5">
                    {h.question}
                  </div>
                  <div style={{ color: colors.textFaint }} className="text-xs mt-1.5 flex items-center gap-1">
                    <Clock size={11} /> {h.date} {h.time ? `à ${h.time}` : ""}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  color={colors.textFaint}
                  style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
                  className="flex-shrink-0 mt-1"
                />
              </button>

              {isOpen && h.answer && (
                <div
                  style={{ borderTop: `1px solid ${colors.bgGradTop}`, color: colors.text }}
                  className="px-5 py-4 text-sm leading-relaxed"
                >
                  <MarkdownText text={h.answer} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}