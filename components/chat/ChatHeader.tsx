"use client";

import { LogOut, Plus, MessageSquareX } from "lucide-react";
import Link from "next/link";
import { signOut } from "aws-amplify/auth";
import { COGNITO_CONFIGURED } from "@/lib/auth";

interface ChatHeaderProps {
  title: string;
  userEmail?: string;
  userInitials: string;
  onNewSession: () => void;
  showNewButton: boolean;
}

export function ChatHeader({ title, userEmail, userInitials, onNewSession, showNewButton }: ChatHeaderProps) {
  async function handleSignOut() {
    if (COGNITO_CONFIGURED) {
      await signOut();
      window.location.href = "/";
    }
  }

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-[#ccd9eb] bg-white shrink-0 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        {showNewButton && (
          <button
            onClick={onNewSession}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#ccd9eb] hover:bg-[#e8eef6] text-[#4a6889] transition-colors shrink-0"
          >
            <Plus size={15} />
          </button>
        )}
        <h1 className="text-base font-semibold text-[#0f1f35] truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/unanswered"
          className="flex items-center gap-1.5 text-sm text-[#4a6889] hover:text-[#0f1f35] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#e8eef6]"
        >
          <MessageSquareX size={14} />
          <span className="hidden sm:inline">Unanswered</span>
        </Link>
        {userEmail && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1a56db] flex items-center justify-center text-sm font-semibold text-white">
              {userInitials}
            </div>
            <span className="text-sm text-[#4a6889] truncate max-w-[160px]">{userEmail}</span>
          </div>
        )}
        {COGNITO_CONFIGURED && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-[#4a6889] hover:text-[#0f1f35] transition-colors px-2 py-1.5 rounded-lg hover:bg-[#e8eef6]"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        )}
      </div>
    </header>
  );
}
