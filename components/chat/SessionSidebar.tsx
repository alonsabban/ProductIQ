"use client";

import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
}

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeId: string;
  collapsed: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onToggle: () => void;
  userEmail?: string;
}

export function SessionSidebar({
  sessions,
  activeId,
  collapsed,
  onSelect,
  onNew,
  onDelete,
  onToggle,
  userEmail,
}: SessionSidebarProps) {
  const initials = userEmail
    ? userEmail.split("@")[0].split(/[._-]/).map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()
    : "ME";

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 transition-all duration-200 border-r",
        "bg-[var(--sidebar-bg)] border-[var(--sidebar-border)]",
        collapsed ? "w-14" : "w-64"
      )}
    >
      {/* Logo row */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-[var(--sidebar-border)]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a56db] flex items-center justify-center shrink-0">
              <MessageSquare size={14} className="text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight text-base">
              Product<span className="text-[#60a5fa]">IQ</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-[#1a56db] flex items-center justify-center mx-auto">
            <MessageSquare size={14} className="text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "text-[var(--sidebar-muted)] hover:text-white transition-colors rounded p-0.5",
            collapsed && "mx-auto mt-1"
          )}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* New chat button */}
      <div className="px-2 pt-3 pb-2">
        <button
          onClick={onNew}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg px-2 py-2 text-sm font-medium transition-colors",
            "bg-[#1a56db] hover:bg-[#1e40af] text-white",
            collapsed ? "justify-center" : ""
          )}
        >
          <Plus size={15} className="shrink-0" />
          {!collapsed && <span>New conversation</span>}
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-2 py-1 flex flex-col gap-0.5">
        {!collapsed && sessions.length > 0 && (
          <p className="text-[10px] uppercase tracking-widest text-[var(--sidebar-muted)] px-2 py-1.5">
            Conversations
          </p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors",
              s.id === activeId
                ? "bg-[var(--sidebar-active)] text-white"
                : "text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-hover)]"
            )}
            onClick={() => onSelect(s.id)}
          >
            <MessageSquare
              size={14}
              className={cn(
                "shrink-0",
                s.id === activeId ? "text-[#60a5fa]" : "text-[var(--sidebar-muted)]"
              )}
            />
            {!collapsed && (
              <>
                <span className="flex-1 text-sm truncate">{s.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                  className="opacity-0 group-hover:opacity-100 text-[var(--sidebar-muted)] hover:text-red-400 transition-all p-0.5 rounded"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* User footer */}
      {!collapsed && userEmail && (
        <div className="px-3 py-3 border-t border-[var(--sidebar-border)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2e4f78] flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {initials}
            </div>
            <span className="text-xs text-[var(--sidebar-muted)] truncate">{userEmail}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
