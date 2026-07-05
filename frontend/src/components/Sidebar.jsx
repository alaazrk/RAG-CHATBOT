import { useState } from "react";
import { BookOpen, Plus, FileText, Clock, Trash2, ChevronDown } from "lucide-react";
import { colors, formatSize } from "../config";
import MarkdownText from "./MarkdownText";

export default function Sidebar({
  documents,
  selectedDoc,
  onSelectDocument,
  onDeleteDocument,
  history,
  fileInputRef,
  onUploadPdf,
}) {
  const [view, setView] = useState("pdfs"); // 'pdfs' | 'historique'
  const [expandedHistory, setExpandedHistory] = useState(null);

  return (
    <aside
      style={{ backgroundColor: colors.bgApp, borderRight: `1px solid ${colors.border}`, width: 300 }}
      className="flex-shrink-0 flex flex-col h-full overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div
          style={{ backgroundColor: colors.accentSoft }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        >
          <BookOpen size={18} color={colors.accent} strokeWidth={2} />
        </div>
        <div className="text-lg font-semibold">
          <span style={{ color: colors.textPrimary }}>PDF</span>
          <span style={{ color: colors.accent }}>Mind</span>
        </div>
      </div>

      {/* Import */}
      <div className="px-4 pb-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files[0] && onUploadPdf(e.target.files[0])}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ backgroundColor: colors.accent, color: "white" }}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Importer un PDF
        </button>
      </div>

      {/* Segmented control */}
      <div className="px-4 pb-3">
        <div style={{ backgroundColor: colors.bgPanel }} className="flex rounded-lg p-1 gap-1">
          {[
            { id: "pdfs", label: "PDFs", icon: FileText },
            { id: "historique", label: "Historique", icon: Clock },
          ].map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  backgroundColor: active ? colors.bgPanelHover : "transparent",
                  color: active ? colors.textPrimary : colors.textSecondary,
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[13px] font-medium transition-colors"
              >
                <Icon size={13} /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 pb-4 flex flex-col gap-1">
        {view === "pdfs" && (
          <>
            {documents.length === 0 && (
              <p style={{ color: colors.textFaint }} className="text-xs italic px-2 py-2">
                Aucun document. Importe un PDF pour commencer.
              </p>
            )}
            {documents.map((doc) => {
              const active = selectedDoc?.name === doc.name;
              return (
                <div
                  key={doc.name}
                  onClick={() => onSelectDocument(doc)}
                  style={{
                    backgroundColor: active ? colors.bgPanel : "transparent",
                  }}
                  className="group rounded-xl px-3 py-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div
                    style={{ backgroundColor: active ? colors.accentSoft : colors.bgPanel }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  >
                    <FileText size={15} color={active ? colors.accent : colors.textSecondary} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div style={{ color: colors.textPrimary }} className="text-[13px] font-medium truncate">
                      {doc.name}
                    </div>
                    <div style={{ color: colors.textFaint }} className="text-[11px] font-mono">
                      {formatSize(doc.size)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Supprimer "${doc.name}" ?`)) onDeleteDocument(doc.name);
                    }}
                    style={{ color: colors.textFaint }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:text-red-400 transition-opacity flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </>
        )}

        {view === "historique" && (
          <>
            {history.length === 0 && (
              <p style={{ color: colors.textFaint }} className="text-xs italic px-2 py-2">
                Aucune question posée pour l'instant.
              </p>
            )}
            {history.map((h, i) => {
              const isOpen = expandedHistory === i;
              return (
                <div key={i} className="rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedHistory(isOpen ? null : i)}
                    style={{ backgroundColor: isOpen ? colors.bgPanel : "transparent" }}
                    className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-white/5 transition-colors"
                  >
                    <div
                      style={{ backgroundColor: colors.bgPanel }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <FileText size={14} color={colors.textSecondary} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div style={{ color: colors.textSecondary }} className="text-[11px] truncate">
                        {h.filename}
                      </div>
                      <div style={{ color: colors.textPrimary }} className="text-[13px] truncate">
                        {h.question}
                      </div>
                      <div style={{ color: colors.textFaint }} className="text-[10px] font-mono mt-0.5">
                        {h.date} · {h.time}
                      </div>
                    </div>
                    <ChevronDown
                      size={13}
                      color={colors.textFaint}
                      style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
                      className="flex-shrink-0 mt-1"
                    />
                  </button>
                  {isOpen && h.answer && (
                    <div
                      style={{ color: colors.textSecondary, borderTop: `1px solid ${colors.border}` }}
                      className="px-3 pb-3 pt-2 text-[12px] leading-relaxed"
                    >
                      <MarkdownText text={h.answer} />
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
}