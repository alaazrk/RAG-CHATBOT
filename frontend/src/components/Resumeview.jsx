import { FileText, Sparkles, Loader2, RefreshCw, Upload, RotateCcw, Clock, Trash2 } from "lucide-react";
import { colors } from "../config";
import MarkdownText from "./MarkdownText";

export default function ResumeView({
  documents,
  isLoadingDocs,
  onRefreshDocs,
  selectedFilename,
  onSelectDocument,
  onRegenerateSummary,
  onDeleteDocument,
  summary,
  isSummarizing,
  summariesCache,
  resumeInputRef,
  onUploadForResume,
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-6 pb-4 bg-white/30 flex items-center justify-between">
        <div>
          <h1 style={{ color: colors.text }} className="text-2xl font-bold">
            Resume Analysis
          </h1>
          <p style={{ color: colors.textSoft }} className="text-sm mt-1">
            Choisis un document indexé, ou uploade-en un nouveau, pour en obtenir un résumé.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={resumeInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files[0] && onUploadForResume(e.target.files[0])}
          />
          <button
            onClick={() => resumeInputRef.current?.click()}
            style={{
              background: `linear-gradient(135deg, ${colors.accentDark}, ${colors.accent})`,
              color: "white",
            }}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            <Upload size={13} /> Upload PDF
          </button>
          <button
            onClick={onRefreshDocs}
            style={{ color: colors.accent }}
            className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70"
          >
            <RefreshCw size={13} className={isLoadingDocs ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Liste des documents */}
        <div className="w-64 flex-shrink-0 overflow-y-auto px-4 py-4 flex flex-col gap-2 border-r border-white/40">
          {documents.length === 0 && !isLoadingDocs && (
            <p style={{ color: colors.textSoft }} className="text-xs italic px-1">
              Aucun document indexé. Uploade un PDF ci-dessus ou depuis l'onglet Chat.
            </p>
          )}
          {documents.map((doc) => {
            const active = doc.name === selectedFilename;
            const cached = summariesCache[doc.name];
            return (
              <div
                key={doc.name}
                style={{
                  backgroundColor: active ? colors.bubble : "transparent",
                  border: `1px solid ${active ? colors.accent : "transparent"}`,
                }}
                className="rounded-xl flex items-start gap-1.5 shadow-sm transition-colors group"
              >
                <button
                  onClick={() => onSelectDocument(doc.name)}
                  className="text-left flex items-start gap-2 px-3 py-2.5 flex-1 min-w-0"
                  style={{ color: colors.text }}
                >
                  <FileText size={15} color={colors.accent} className="mt-0.5 flex-shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm truncate">{doc.name}</span>
                    <span style={{ color: colors.textSoft }} className="block text-[11px]">
                      {doc.size} KB
                    </span>
                    {cached && (
                      <span style={{ color: colors.accent }} className="flex items-center gap-1 text-[10px] mt-1">
                        <Clock size={10} /> Résumé le {cached.date}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Supprimer "${doc.name}" ? Cette action retire aussi son contenu indexé.`)) {
                      onDeleteDocument(doc.name);
                    }
                  }}
                  style={{ color: colors.textFaint }}
                  className="p-2 mr-1 mt-1 rounded-lg hover:opacity-70 hover:text-red-500 flex-shrink-0"
                  title="Supprimer ce document"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Résumé */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex items-center justify-center">
          {!selectedFilename && (
            <div className="text-center max-w-sm" style={{ color: colors.textSoft }}>
              <Sparkles size={26} className="mx-auto mb-3" color={colors.accent} strokeWidth={1.5} />
              Sélectionne un document dans la liste pour générer son résumé.
            </div>
          )}

          {selectedFilename && isSummarizing && (
            <div className="text-center" style={{ color: colors.textSoft }}>
              <Loader2 size={26} className="animate-spin mx-auto mb-3" />
              Résumé de {selectedFilename} en cours… (peut prendre 30s-1min sur un long document)
            </div>
          )}

          {selectedFilename && !isSummarizing && summary && (
            <div style={{ backgroundColor: colors.bubble }} className="rounded-2xl shadow-sm p-6 w-full max-w-lg">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 style={{ color: colors.text }} className="font-semibold">
                  {summary.filename}
                </h3>
                <button
                  onClick={() => onRegenerateSummary(selectedFilename)}
                  style={{ color: colors.accent }}
                  className="flex items-center gap-1 text-xs font-medium hover:opacity-70 flex-shrink-0"
                  title="Régénérer le résumé"
                >
                  <RotateCcw size={12} /> Régénérer
                </button>
              </div>
              <div style={{ color: colors.textSoft }} className="text-sm leading-relaxed">
                <MarkdownText text={summary.summary} />
              </div>
              {summary.insights?.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2">
                  {summary.insights.map((ins, i) => (
                    <li key={i} style={{ color: colors.text }} className="text-sm flex gap-2">
                      <span style={{ color: colors.accent }} className="flex-shrink-0">•</span>
                      <span className="flex-1"><MarkdownText text={ins} /></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}