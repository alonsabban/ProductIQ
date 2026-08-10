"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, MessageSquareX } from "lucide-react";
import type { UnansweredQuestion } from "@/lib/unanswered-questions";

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function UnansweredPage() {
  const [items, setItems] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/unanswered");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setItems(data);
    } catch {
      setError("Could not load unanswered questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-[#ccd9eb] bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[#4a6889] hover:text-[#0f1f35] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#e8eef6]"
          >
            <ArrowLeft size={14} />
            <span>Back to Chat</span>
          </Link>
          <span className="text-[#ccd9eb]">|</span>
          <h1 className="text-base font-semibold text-[#0f1f35]">Unanswered Questions</h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-[#4a6889] hover:text-[#0f1f35] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#e8eef6] disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="bg-white border border-[#ccd9eb] rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#fff0f3] flex items-center justify-center">
              <MessageSquareX size={16} className="text-[#e45c7a]" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0f1f35]">{loading ? "—" : items.length}</div>
              <div className="text-xs text-[#4a6889]">Total unanswered</div>
            </div>
          </div>
          <div className="bg-white border border-[#ccd9eb] rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#f0f6ff] flex items-center justify-center">
              <span className="text-sm">❓</span>
            </div>
            <div>
              <div className="text-xl font-bold text-[#0f1f35]">
                {loading ? "—" : items.filter((i) => !i.product).length}
              </div>
              <div className="text-xs text-[#4a6889]">No product identified</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#ccd9eb] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#eef2f7]">
            <h2 className="text-sm font-semibold text-[#0f1f35]">All Questions</h2>
            <p className="text-xs text-[#4a6889] mt-0.5">
              Sorted newest first · Questions with no answer found in the documentation
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 text-[#4a6889] text-sm gap-2">
              <RefreshCw size={16} className="animate-spin" />
              Loading…
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-20 text-[#e45c7a] text-sm">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f0f4f9] flex items-center justify-center">
                <MessageSquareX size={22} className="text-[#9ab0c8]" />
              </div>
              <p className="text-sm text-[#4a6889]">No unanswered questions yet</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafd] border-b border-[#eef2f7]">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#4a6889] uppercase tracking-wide whitespace-nowrap">
                      Date &amp; Time
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#4a6889] uppercase tracking-wide">
                      Asked By
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#4a6889] uppercase tracking-wide">
                      Product
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#4a6889] uppercase tracking-wide">
                      Question
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const { date, time } = formatDate(item.timestamp);
                    return (
                      <tr
                        key={item.questionId}
                        className={`border-b border-[#f0f4f9] hover:bg-[#fafbfd] transition-colors ${
                          i === items.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-medium text-[#0f1f35]">{date}</div>
                          <div className="text-xs text-[#4a6889] mt-0.5">{time}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block bg-[#f0f6ff] text-[#1a56db] text-xs font-medium px-2.5 py-1 rounded-full">
                            {item.userId}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {item.product ? (
                            <span className="inline-block bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] text-xs font-semibold px-2.5 py-1 rounded-md">
                              {item.product}
                            </span>
                          ) : (
                            <span className="inline-block bg-[#fffbeb] text-[#b45309] border border-[#fde68a] text-xs font-semibold px-2.5 py-1 rounded-md">
                              Unknown
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-[#0f1f35] max-w-md">
                          {item.question}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
