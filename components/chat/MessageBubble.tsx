import { cn } from "@/lib/utils";
import { CitationChip } from "./CitationChip";
import type { ChatSource } from "@/lib/bedrock";
import { Bot } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  loading?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  userInitials: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 h-6 px-1">
      <span className="typing-dot w-2.5 h-2.5 rounded-full bg-[#1a56db]" />
      <span className="typing-dot w-2.5 h-2.5 rounded-full bg-[#1a56db]" />
      <span className="typing-dot w-2.5 h-2.5 rounded-full bg-[#1a56db]" />
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      return (
        <sup key={i} className="inline-flex items-center justify-center w-4 h-4 mx-0.5 rounded text-[10px] font-semibold bg-[#e3eaf5] text-[#1a56db] align-super leading-none">
          {match[1]}
        </sup>
      );
    }
    return part;
  });
}

function renderContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc">
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ul>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal">
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ol>
      );
    } else {
      elements.push(<p key={i}>{renderInline(line)}</p>);
      i++;
    }
  }
  return elements;
}

export function MessageBubble({ message, userInitials }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 w-full", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5",
          isUser
            ? "bg-[#1a56db] text-white"
            : "bg-white border border-[#ccd9eb] text-[#1a56db] shadow-sm"
        )}
      >
        {isUser ? userInitials : <Bot size={17} />}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col max-w-[78%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-5 py-3.5 rounded-2xl text-base leading-relaxed shadow-sm",
            isUser
              ? "bg-[#1a56db] text-white rounded-tr-sm"
              : "bg-white border border-[#ccd9eb] text-[#0f1f35] rounded-tl-sm"
          )}
        >
          {message.loading ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap text-base">{message.content}</p>
          ) : (
            <div className="prose-chat">{renderContent(message.content)}</div>
          )}
        </div>
        {!message.loading && !isUser && message.sources && message.sources.length > 0 && (
          <div className="px-1 mt-1">
            <CitationChip sources={message.sources} />
          </div>
        )}
      </div>
    </div>
  );
}
