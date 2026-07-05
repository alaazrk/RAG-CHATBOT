import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { colors } from "../config";

export default function MarkdownText({ text }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 flex flex-col gap-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 flex flex-col gap-1">{children}</ol>,
        strong: ({ children }) => (
          <strong style={{ color: colors.textPrimary }} className="font-semibold">
            {children}
          </strong>
        ),
        code: ({ children }) => (
          <code
            style={{ backgroundColor: colors.bgApp, color: colors.textLink }}
            className="px-1.5 py-0.5 rounded text-[13px] font-mono"
          >
            {children}
          </code>
        ),
        h1: ({ children }) => (
          <h3 style={{ color: colors.textPrimary }} className="font-bold text-base mb-1.5 mt-1">
            {children}
          </h3>
        ),
        h2: ({ children }) => (
          <h3 style={{ color: colors.textPrimary }} className="font-bold text-base mb-1.5 mt-1">
            {children}
          </h3>
        ),
        h3: ({ children }) => (
          <h4 style={{ color: colors.textPrimary }} className="font-semibold text-sm mb-1 mt-1">
            {children}
          </h4>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}