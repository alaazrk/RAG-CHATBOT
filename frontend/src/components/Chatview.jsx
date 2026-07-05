import { Paperclip, Send, Loader2, Bot, User } from "lucide-react";
import { colors } from "../config";
import MarkdownText from "./MarkdownText";

export default function ChatView({
  messages,
  input,
  setInput,
  onKeyDown,
  sendMessage,
  isSending,
  scrollRef,
  fileInputRef,
  selectedDoc,
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 flex flex-col gap-4">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div
                  style={{ backgroundColor: colors.accentSoft }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Bot size={15} color={colors.accent} />
                </div>
              )}
              <div className="max-w-[65%] flex flex-col" style={{ alignItems: isUser ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    backgroundColor: colors.bgPanel,
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                  }}
                  className="rounded-2xl px-4 py-3 text-[14px] leading-relaxed"
                >
                  {isUser ? (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  ) : (
                    <MarkdownText text={msg.text} />
                  )}
                </div>
                <span style={{ color: colors.textFaint }} className="text-[11px] mt-1.5 px-1 font-mono">
                  {msg.time}
                </span>
              </div>
              {isUser && (
                <div
                  style={{ backgroundColor: colors.accentSoft }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <User size={15} color={colors.accent} />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3 justify-start">
            <div
              style={{ backgroundColor: colors.accentSoft }}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Bot size={15} color={colors.accent} />
            </div>
            <div
              style={{ backgroundColor: colors.bgPanel, border: `1px solid ${colors.border}`, color: colors.textSecondary }}
              className="rounded-2xl px-4 py-3 text-sm flex items-center gap-2"
            >
              <Loader2 size={14} className="animate-spin" /> Réflexion en cours…
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="px-6 pb-5 pt-2">
        <div
          style={{ backgroundColor: colors.bgPanel, border: `1px solid ${colors.border}` }}
          className="flex items-center gap-3 rounded-2xl px-4 py-1"
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ color: colors.textFaint }}
            className="hover:text-white transition-colors flex-shrink-0"
            title="Importer un PDF"
          >
            <Paperclip size={17} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={selectedDoc ? "Posez une question sur le document..." : "Importez un PDF pour commencer..."}
            style={{ color: colors.textPrimary }}
            className="flex-1 bg-transparent text-sm py-3 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{ backgroundColor: colors.accent }}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity"
          >
            <Send size={14} color="white" />
          </button>
        </div>
        <p style={{ color: colors.textFaint }} className="text-center text-[11px] mt-2.5">
          Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
        </p>
      </div>
    </>
  );
}