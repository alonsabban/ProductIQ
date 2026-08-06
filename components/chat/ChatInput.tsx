"use client";

import { useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSubmit, loading, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) onSubmit();
    }
  }

  return (
    <div className="border-t border-[#ccd9eb] bg-white px-4 py-4 shadow-[0_-1px_4px_rgba(0,0,0,0.04)]">
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            placeholder="Ask about Idira products…"
            className={cn(
              "w-full resize-none rounded-xl border border-[#ccd9eb] bg-[#f8fafc]",
              "px-4 py-3.5 text-base text-[#0f1f35] placeholder:text-[#9ab0c8]",
              "focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent focus:bg-white",
              "disabled:opacity-50 transition-all duration-150 leading-relaxed"
            )}
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim() || disabled}
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150",
            "bg-[#1a56db] hover:bg-[#1e40af] text-white shadow-sm",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
      <p className="text-center text-xs text-[#9ab0c8] mt-2.5">
        Answers are grounded in official Idira documentation ·{" "}
        <kbd className="font-mono bg-[#e8eef6] px-1 py-0.5 rounded text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
