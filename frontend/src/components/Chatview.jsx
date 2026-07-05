import { Upload, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { colors } from "../config";

export default function ChatView({
  messages,
  input,
  setInput,
  onKeyDown,
  sendMessage,
  isSending,
  scrollRef,
  fileInputRef,
}) {
  return (
    <>
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h1 style={{ color: colors.text }} className="text-2xl font-bold">
          PDF Chat Assistant
        </h1>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: `linear-gradient(135deg, ${colors.accentDark}, ${colors.accent})`,
            color: "white",
          }}
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
        >
          <Upload size={15} /> Upload PDF
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[70%] flex flex-col"
              style={{ alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}
            >
              <div
                style={{
                  backgroundColor: msg.role === "user" ? colors.accent : colors.bubble,
                  color: msg.role === "user" ? "white" : colors.text,
                }}
                className="rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm markdown-bubble"
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-2 flex flex-col gap-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 flex flex-col gap-1">{children}</ol>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      code: ({ children }) => (
                        <code
                          style={{ backgroundColor: colors.bgGradTop }}
                          className="px-1.5 py-0.5 rounded text-[13px] font-mono"
                        >
                          {children}
                        </code>
                      ),
                      h1: ({ children }) => <h3 className="font-bold text-base mb-1.5 mt-1">{children}</h3>,
                      h2: ({ children }) => <h3 className="font-bold text-base mb-1.5 mt-1">{children}</h3>,
                      h3: ({ children }) => <h4 className="font-semibold text-sm mb-1 mt-1">{children}</h4>,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                )}
              </div>
              <span style={{ color: colors.textSoft }} className="text-[11px] mt-1 px-1">
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div
              style={{ backgroundColor: colors.bubble, color: colors.textSoft }}
              className="rounded-2xl px-5 py-3.5 text-sm flex items-center gap-2 shadow-sm"
            >
              <Loader2 size={14} className="animate-spin" /> Thinking…
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="px-6 pb-6 pt-2">
        <div style={{ backgroundColor: colors.bubble }} className="flex items-center gap-2 rounded-full px-5 py-2 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a question about your PDF..."
            style={{ color: colors.text }}
            className="flex-1 bg-transparent text-sm py-2 focus:outline-none placeholder:text-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{ backgroundColor: colors.accent }}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
          >
            <Send size={15} color="white" />
          </button>
        </div>
      </div>
    </>
  );
}