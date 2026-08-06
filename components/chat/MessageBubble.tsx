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
    <div className="flex items-center gap-1 h-5 px-1">
      <span className="typing-dot w-2 h-2 rounded-full bg-[oklch(0.55_0.22_260)]" />
      <span className="typing-dot w-2 h-2 rounded-full bg-[oklch(0.55_0.22_260)]" />
      <span className="typing-dot w-2 h-2 rounded-full bg-[oklch(0.55_0.22_260)]" />
    </div>
  );
}

function renderContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc">
          {items.map((item, j) => <li key={j}>{item}</li>)}
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
          {items.map((item, j) => <li key={j}>{item}</li>)}
        </ol>
      );
    } else {
      elements.push(<p key={i}>{line}</p>);
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
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5",
          isUser
            ? "bg-[oklch(0.45_0.20_260)] text-white"
            : "bg-[oklch(0.18_0.05_240)] border border-[oklch(0.25_0.06_240)] text-[oklch(0.65_0.18_230)]"
        )}
      >
        {isUser ? userInitials : <Bot size={15} />}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col max-w-[75%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-[oklch(0.45_0.20_260)] text-white rounded-tr-sm"
              : "bg-[oklch(0.14_0.035_240)] border border-[oklch(0.22_0.05_240)] text-[oklch(0.92_0.01_230)] rounded-tl-sm"
          )}
        >
          {message.loading ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-chat">{renderContent(message.content)}</div>
          )}
        </div>
        {!message.loading && !isUser && message.sources && message.sources.length > 0 && (
          <div className="px-1">
            <CitationChip sources={message.sources} />
          </div>
        )}
      </div>
    </div>
  );
}
