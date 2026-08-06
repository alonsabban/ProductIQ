"use client";

import { LogOut, MessageSquare } from "lucide-react";
import { signOut } from "aws-amplify/auth";
import { COGNITO_CONFIGURED } from "@/lib/auth";

interface ChatHeaderProps {
  userEmail?: string;
}

export function ChatHeader({ userEmail }: ChatHeaderProps) {
  async function handleSignOut() {
    if (COGNITO_CONFIGURED) {
      await signOut();
      window.location.href = "/";
    }
  }

  const initials = userEmail
    ? userEmail.split("@")[0].slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-[oklch(0.18_0.04_240)] bg-[oklch(0.10_0.028_240)] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[oklch(0.55_0.22_260)] flex items-center justify-center">
          <MessageSquare size={14} className="text-white" />
        </div>
        <span className="font-semibold text-[oklch(0.92_0.01_230)] tracking-tight">
          Product<span className="text-[oklch(0.60_0.22_260)]">IQ</span>
        </span>
        <span className="hidden sm:block text-[10px] text-[oklch(0.42_0.04_240)] border border-[oklch(0.22_0.05_240)] rounded px-1.5 py-0.5 ml-1">
          CyberArk Docs
        </span>
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        {userEmail && (
          <span className="hidden sm:block text-xs text-[oklch(0.58_0.05_240)] truncate max-w-[180px]">
            {userEmail}
          </span>
        )}
        {COGNITO_CONFIGURED && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-[oklch(0.50_0.04_240)] hover:text-[oklch(0.75_0.05_230)] transition-colors px-2 py-1.5 rounded-lg hover:bg-[oklch(0.15_0.03_240)]"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        )}
      </div>
    </header>
  );
}
