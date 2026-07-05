import { Sparkles, Loader2, Download, RotateCcw, FileText } from "lucide-react";
import { colors } from "../config";
import MarkdownText from "./MarkdownText";

function exportSummaryAsText(summary) {
  const lines = [
    `Résumé — ${summary.filename}`,
    "",
    summary.summary || "",
    "",
    ...(summary.insights || []).map((ins) => `- ${ins}`),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resume-${summary.filename.replace(/\.pdf$/i, "")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ResumeView({ selectedDoc, summary, isSummarizing, onRegenerateSummary }) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
      {!selectedDoc && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-sm" style={{ color: colors.textSecondary }}>
            <FileText size={28} className="mx-auto mb-3" color={colors.textFaint} strokeWidth={1.5} />
            Sélectionne un document dans la barre latérale pour générer son résumé.
          </div>
        </div>
      )}

      {selectedDoc && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: colors.accentSoft }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
              >
                <Sparkles size={15} color={colors.accent} />
              </div>
              <span style={{ color: colors.textPrimary }} className="font-semibold text-[15px]">
                Résumé IA
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => summary && exportSummaryAsText(summary)}
                disabled={!summary}
                style={{ backgroundColor: colors.bgPanel, color: colors.textSecondary, border: `1px solid ${colors.border}` }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium disabled:opacity-40 hover:text-white transition-colors"
              >
                <Download size={13} /> Exporter
              </button>
              <button
                onClick={() => onRegenerateSummary(selectedDoc.name)}
                disabled={isSummarizing}
                style={{ backgroundColor: colors.accent, color: "white" }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                <RotateCcw size={13} /> Régénérer
              </button>
            </div>
          </div>

          <div
            style={{ backgroundColor: colors.bgPanel, border: `1px solid ${colors.border}` }}
            className="rounded-2xl p-6"
          >
            {isSummarizing && (
              <div style={{ color: colors.textSecondary }} className="flex items-center gap-2 text-sm py-6 justify-center">
                <Loader2 size={16} className="animate-spin" />
                Génération du résumé en cours…
              </div>
            )}

            {!isSummarizing && summary && (
              <>
                <h2 style={{ color: colors.textLink }} className="font-semibold text-[17px] mb-4">
                  Résumé — {summary.filename}
                </h2>

                <h3 style={{ color: colors.textPrimary }} className="font-semibold text-sm mb-2">
                  Vue d'ensemble
                </h3>
                <div style={{ color: colors.textSecondary }} className="text-[14px] leading-relaxed mb-5">
                  <MarkdownText text={summary.summary} />
                </div>

                {summary.insights?.length > 0 && (
                  <>
                    <h3 style={{ color: colors.textPrimary }} className="font-semibold text-sm mb-2">
                      Points clés
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {summary.insights.map((ins, i) => (
                        <li key={i} className="flex gap-2 text-[14px]" style={{ color: colors.textSecondary }}>
                          <span style={{ color: colors.accent }} className="flex-shrink-0">•</span>
                          <span className="flex-1"><MarkdownText text={ins} /></span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {!isSummarizing && !summary && (
              <p style={{ color: colors.textFaint }} className="text-sm text-center py-6">
                Aucun résumé généré pour l'instant.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}