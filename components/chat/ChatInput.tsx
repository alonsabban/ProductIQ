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
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) onSubmit();
    }
  }

  return (
    <div className="border-t border-[oklch(0.18_0.04_240)] bg-[oklch(0.10_0.028_240)] px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            placeholder="Ask about CyberArk products…"
            className={cn(
              "w-full resize-none rounded-xl border border-[oklch(0.22_0.05_240)] bg-[oklch(0.14_0.035_240)]",
              "px-4 py-3 pr-12 text-sm text-[oklch(0.92_0.01_230)] placeholder:text-[oklch(0.42_0.04_240)]",
              "focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.22_260)] focus:border-transparent",
              "disabled:opacity-50 transition-all duration-150 leading-relaxed"
            )}
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim() || disabled}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150",
            "bg-[oklch(0.55_0.22_260)] hover:bg-[oklch(0.48_0.22_260)] text-white",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
      <p className="text-center text-[10px] text-[oklch(0.38_0.03_240)] mt-2">
        Answers are based on official CyberArk documentation · <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
