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
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-[#4a6889] hover:text-[#1a56db] transition-colors"
      >
        <FileText size={13} />
        <span>{sources.length} source{sources.length > 1 ? "s" : ""}</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <ul className="mt-2 flex flex-col gap-1.5 pl-1">
          {sources.map((src, i) => (
            <li key={i}>
              <a
                href={`https://docs.cyberark.com/${src.uri.replace(/^s3:\/\/[^/]+\//, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#1a56db] hover:text-[#1e40af] transition-colors group"
              >
                <span className="w-5 h-5 flex items-center justify-center rounded bg-[#e3eaf5] text-xs font-semibold text-[#1a56db] shrink-0">
                  {i + 1}
                </span>
                <span className="truncate max-w-[260px] group-hover:underline underline-offset-2">
                  {src.title}
                </span>
                <ExternalLink size={11} className="shrink-0 opacity-50 group-hover:opacity-100" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
