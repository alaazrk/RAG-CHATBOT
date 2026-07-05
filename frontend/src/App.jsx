import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { colors, nowTime } from "./config";
import { uploadDocument, sendChatMessage, listDocuments, summarizeDocument, deleteDocument } from "./services/api";
import Sidebar from "./components/Sidebar";
import ChatView from "./components/ChatView";
import ResumeView from "./components/ResumeView";
import HistoryView from "./components/HistoryView";
import { Menu } from "lucide-react";

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
  } catch {
    // stockage plein ou indisponible — on continue sans persister
  }
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
  } catch {
    // stockage plein ou indisponible — on continue sans persister
  }
}

export default function App() {
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm your PDF assistant. Upload a PDF to get started, or ask me questions about your uploaded document.",
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  
  // Resume tab
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedFilename, setSelectedFilename] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summariesCache, setSummariesCache] = useState(() => loadSummaryCache());

  const [history, setHistory] = useState(() => loadChatHistory());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (tab === "resume") refreshDocuments();
  }, [tab]);

  async function refreshDocuments() {
    setIsLoadingDocs(true);
    try {
      const data = await listDocuments();
      setDocuments(data.documents || []);
    } catch {
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }

  async function handleUploadPdf(file) {
    if (!file || file.type !== "application/pdf") return;
    try {
      const doc = await uploadDocument(file);
      setActiveDoc(doc);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `"${doc.filename}" is ready. Ask me anything about it.`, time: nowTime() },
      ]);
      return doc;
    } catch {
      const fallback = { id: "local", filename: file.name };
      setActiveDoc(fallback);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I couldn't reach the server, but "${file.name}" is selected. Check that your API is running.`,
          time: nowTime(),
        },
      ]);
      return fallback;
    }
  }

  // Upload déclenché depuis l'onglet Resume : upload + refresh de la liste + sélection directe
  async function handleUploadForResume(file) {
    const doc = await handleUploadPdf(file);
    await refreshDocuments();
    if (doc?.filename) handleSelectDocument(doc.filename);
  }

  // Upload déclenché depuis la sidebar (bouton "Add PDF") : bascule vers
  // l'onglet Chat après upload, sinon le message de confirmation reste
  // invisible si on est sur un autre onglet — ce qui donnait l'impression
  // que le bouton ne faisait rien.
  async function handleUploadFromSidebar(file) {
    await handleUploadPdf(file);
    setTab("chat");
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending) return;
    setMessages((prev) => [...prev, { role: "user", text, time: nowTime() }]);
    setInput("");
    setIsSending(true);
    try {
      const data = await sendChatMessage(text, activeDoc?.filename);
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, time: nowTime() }]);
      setHistory((prev) => {
        const next = [
          {
            filename: data.sources?.length ? data.sources.join(", ") : "—",
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

  // Sélectionner un document : si un résumé existe déjà en cache, l'afficher directement
  // sans relancer Groq. Un bouton "Régénérer" permet de forcer un nouveau résumé.
  function handleSelectDocument(filename) {
    setSelectedFilename(filename);
    const cached = summariesCache[filename];
    if (cached) {
      setSummary(cached);
    } else {
      runSummary(filename);
    }
  }

  function handleRegenerateSummary(filename) {
    runSummary(filename);
  }

  async function handleDeleteDocument(filename) {
    try {
      await deleteDocument(filename);
    } catch {
      // même si la requête échoue côté réseau, on rafraîchit quand même
      // la liste pour refléter l'état réel du serveur
    }
    await refreshDocuments();
    if (selectedFilename === filename) {
      setSelectedFilename(null);
      setSummary(null);
    }
    setSummariesCache((prev) => {
      if (!(filename in prev)) return prev;
      const next = { ...prev };
      delete next[filename];
      saveSummaryCache(next);
      return next;
    });
    if (activeDoc?.filename === filename) {
      setActiveDoc(null);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleClearHistory() {
    setHistory([]);
    saveChatHistory([]);
  }

  return (
    <div
  className="flex h-screen w-full"
  style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
     <Sidebar
        tab={tab}
        setTab={setTab}
        fileInputRef={fileInputRef}
        onUploadPdf={handleUploadFromSidebar}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
    />
       <main
          className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-[300px]" : "ml-0"
         }`}
          style={{
             background: `linear-gradient(180deg, ${colors.bgGradTop}, ${colors.bgGradBottom})`,
        }} 
       >
        <div className="flex items-center gap-3 px-6 py-4 bg-white/40 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`${sidebarOpen ? "hidden" : "flex"} items-center justify-center`}
          >
            <Menu size={22} color={colors.text} />
            </button>
          <X size={18} color={colors.accent} strokeWidth={2.5} />
          <div style={{ backgroundColor: colors.textFaint, width: 1, height: 16 }} />
          <span style={{ color: colors.text }} className="text-[15px] font-medium capitalize">
            {tab}
          </span>
        </div>

        {tab === "chat" && (
          <ChatView
            messages={messages}
            input={input}
            setInput={setInput}
            onKeyDown={onKeyDown}
            sendMessage={sendMessage}
            isSending={isSending}
            scrollRef={scrollRef}
            fileInputRef={fileInputRef}
          />
        )}

        {tab === "resume" && (
          <ResumeView
            documents={documents}
            isLoadingDocs={isLoadingDocs}
            onRefreshDocs={refreshDocuments}
            selectedFilename={selectedFilename}
            onSelectDocument={handleSelectDocument}
            onRegenerateSummary={handleRegenerateSummary}
            onDeleteDocument={handleDeleteDocument}
            summary={summary}
            isSummarizing={isSummarizing}
            summariesCache={summariesCache}
            resumeInputRef={resumeInputRef}
            onUploadForResume={handleUploadForResume}
          />
        )}

        {tab === "history" && <HistoryView history={history} onClearHistory={handleClearHistory} />}
      </main>
    </div>
  );
}