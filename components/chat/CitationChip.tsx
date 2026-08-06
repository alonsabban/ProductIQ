"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { ChatSource } from "@/lib/bedrock";

interface CitationChipProps {
  sources: ChatSource[];
}

export function CitationChip({ sources }: CitationChipProps) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-[oklch(0.60_0.10_230)] hover:text-[oklch(0.75_0.15_230)] transition-colors"
      >
        <FileText size={12} />
        <span>
          {sources.length} source{sources.length > 1 ? "s" : ""}
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {sources.map((src, i) => (
            <li key={i}>
              <a
                href={`https://s3.console.aws.amazon.com/s3/object/${src.uri.replace("s3://", "").replace("/", "?prefix=")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[oklch(0.65_0.15_220)] hover:text-[oklch(0.80_0.18_220)] transition-colors group"
              >
                <span className="w-4 h-4 flex items-center justify-center rounded bg-[oklch(0.18_0.05_240)] text-[10px] text-[oklch(0.55_0.22_260)] shrink-0">
                  {i + 1}
                </span>
                <span className="truncate max-w-[240px] group-hover:underline underline-offset-2">
                  {src.title}
                </span>
                <ExternalLink size={10} className="shrink-0 opacity-50 group-hover:opacity-100" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
