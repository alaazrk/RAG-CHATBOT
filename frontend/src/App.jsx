import { useState, useRef, useEffect } from "react";
import { MessageSquare, AlignLeft, Download, MoreVertical, FileText, Trash2 } from "lucide-react";
import { colors, nowTime, formatSize } from "./config";
import { uploadDocument, sendChatMessage, listDocuments, summarizeDocument, deleteDocument } from "./services/api";
import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import ResumeView from "./components/ResumeView";
import QuizView from "./components/QuizView";
import { generateQuiz } from "./services/api";

const SUMMARY_CACHE_KEY = "pdf-assistant-summaries";
const CHAT_HISTORY_KEY = "pdf-assistant-chat-history";

function loadSummaryCache() {
  try {
    const raw = localStorage.getItem(SUMMARY_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveSummaryCache(cache) {
  try {
    localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}
function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveChatHistory(history) {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [mainTab, setMainTab] = useState("chat"); // 'chat' | 'resume'
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Bonjour ! Importez un PDF pour commencer, ou posez-moi une question sur un document déjà importé.",
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summariesCache, setSummariesCache] = useState(() => loadSummaryCache());

  const [quiz, setQuiz] = useState(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const [history, setHistory] = useState(() => loadChatHistory());

  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    refreshDocuments();
  }, []);

  async function refreshDocuments() {
    try {
      const data = await listDocuments();
      setDocuments(data.documents || []);
    } catch {
      setDocuments([]);
    }
  }

  async function handleUploadPdf(file) {
    if (!file || file.type !== "application/pdf") return;
    try {
      const doc = await uploadDocument(file);
      await refreshDocuments();
      const newDoc = { name: doc.filename, size: null };
      setSelectedDoc(newDoc);
      setMainTab("chat");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `"${doc.filename}" est prêt. Posez-moi une question à son sujet.`, time: nowTime() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Impossible de joindre le serveur. Vérifie que ton backend tourne.", time: nowTime() },
      ]);
    }
  }

  function handleSelectDocument(doc) {
    setSelectedDoc(doc);
    setQuiz(null);
    setMenuOpen(false);
    const cached = summariesCache[doc.name];
    setSummary(cached || null);
    if (mainTab === "resume" && !cached) {
      runSummary(doc.name);
    }
  }

  function handleSelectTab(tab) {
    setMainTab(tab);
    if (tab === "resume" && selectedDoc) {
      const cached = summariesCache[selectedDoc.name];
      if (cached) {
        setSummary(cached);
      } else if (!summary) {
        runSummary(selectedDoc.name);
      }
    }
  }

  async function runSummary(filename) {
    setIsSummarizing(true);
    setSummary(null);
    try {
      const data = await summarizeDocument(filename);
      setSummary(data);
      setSummariesCache((prev) => {
        const next = { ...prev, [filename]: { ...data, date: new Date().toLocaleDateString("fr-FR") } };
        saveSummaryCache(next);
        return next;
      });
    } catch {
      setSummary({ filename, summary: "Impossible de générer le résumé. Vérifie que le serveur tourne.", insights: [] });
    } finally {
      setIsSummarizing(false);
    }
  }

  async function runQuiz(filename) {

  setIsGeneratingQuiz(true);
  setQuiz(null);

  try {

    const data = await generateQuiz(filename);

    setQuiz(data);

  } catch {

    alert("Impossible de générer le quiz.");

  } finally {

    setIsGeneratingQuiz(false);

  }

 }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending) return;
    setMessages((prev) => [...prev, { role: "user", text, time: nowTime() }]);
    setInput("");
    setIsSending(true);
    try {
      const data = await sendChatMessage(text, selectedDoc?.name);
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, time: nowTime() }]);
      setHistory((prev) => {
        const next = [
          {
            filename: data.sources?.length ? data.sources.join(", ") : selectedDoc?.name || "—",
            question: text,
            answer: data.answer,
            date: new Date().toLocaleDateString("fr-FR"),
            time: nowTime(),
          },
          ...prev,
        ];
        saveChatHistory(next);
        return next;
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Impossible de joindre le serveur. Vérifie que ton backend tourne.", time: nowTime() },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function handleDeleteDocument(filename) {
    try {
      await deleteDocument(filename);
    } catch {}
    await refreshDocuments();
    if (selectedDoc?.name === filename) {
      setSelectedDoc(null);
      setSummary(null);
    }
    setSummariesCache((prev) => {
      if (!(filename in prev)) return prev;
      const next = { ...prev };
      delete next[filename];
      saveSummaryCache(next);
      return next;
    });
    setMenuOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: colors.bgApp, color: colors.textPrimary }}
    >
      <Sidebar
        documents={documents}
        selectedDoc={selectedDoc}
        onSelectDocument={handleSelectDocument}
        onDeleteDocument={handleDeleteDocument}
        history={history}
        fileInputRef={fileInputRef}
        onUploadPdf={handleUploadPdf}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* En-tête document */}
        <div
          style={{ borderBottom: `1px solid ${colors.border}` }}
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              style={{ backgroundColor: colors.accentSoft }}
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <FileText size={17} color={colors.accent} />
            </div>
            <div className="min-w-0">
              <div style={{ color: colors.textPrimary }} className="font-semibold text-[15px] truncate">
                {selectedDoc ? selectedDoc.name : "Aucun document sélectionné"}
              </div>
              {selectedDoc && (
                <div style={{ color: colors.textFaint }} className="text-[12px] font-mono">
                  {formatSize(selectedDoc.size)}
                </div>
              )}
            </div>
          </div>

          {selectedDoc && (
            <div className="flex items-center gap-1 relative flex-shrink-0">
              <a
                href={`http://localhost:8000/files/${encodeURIComponent(selectedDoc.name)}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `http://localhost:8000/files/${encodeURIComponent(selectedDoc.name)}`,
                    "_blank"
                  );
                }}
                style={{ color: colors.textFaint }}
                className="p-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                title="Télécharger le PDF"
              >
                <Download size={16} />
              </a>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                style={{ color: colors.textFaint }}
                className="p-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div
                  style={{ backgroundColor: colors.bgPanel, border: `1px solid ${colors.border}` }}
                  className="absolute right-0 top-11 rounded-lg shadow-lg py-1 w-44 z-10"
                >
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer "${selectedDoc.name}" ?`)) {
                        handleDeleteDocument(selectedDoc.name);
                      }
                    }}
                    style={{ color: colors.danger }}
                    className="w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-white/5"
                  >
                    <Trash2 size={13} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Onglets Chat / Résumé */}
        <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0">
          {[
            { id: "chat", label: "Chat", icon: MessageSquare },
            { id: "resume", label: "Résumé", icon: AlignLeft },
            { id: "quiz", label: "Quiz", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                style={{
                  backgroundColor: active ? colors.accent : colors.bgPanel,
                  color: active ? "white" : colors.textSecondary,
                  border: `1px solid ${active ? colors.accent : colors.border}`,
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-semibold transition-colors"
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {mainTab === "chat" && (
          <ChatView
            messages={messages}
            input={input}
            setInput={setInput}
            onKeyDown={onKeyDown}
            sendMessage={sendMessage}
            isSending={isSending}
            scrollRef={scrollRef}
            fileInputRef={fileInputRef}
            selectedDoc={selectedDoc}
          />
        )}

        {mainTab === "resume" && (
          <ResumeView
            selectedDoc={selectedDoc}
            summary={summary}
            isSummarizing={isSummarizing}
            onRegenerateSummary={runSummary}
          />
        )}

        {mainTab === "quiz" && (
          <QuizView
            selectedDoc={selectedDoc}
            quiz={quiz}
            isGeneratingQuiz={isGeneratingQuiz}
            onGenerateQuiz={runQuiz}
          />
        )}
    
        
      </main>
    </div>
  );
}