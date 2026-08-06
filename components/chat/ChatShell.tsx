"use client";

import { useState, useCallback, useEffect } from "react";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { configureAmplify, COGNITO_CONFIGURED } from "@/lib/auth";
import { ChatHeader } from "./ChatHeader";
import { MessageThread } from "./MessageThread";
import { ChatInput } from "./ChatInput";
import type { Message } from "./MessageBubble";
import type { ChatSource } from "@/lib/bedrock";

configureAmplify();

function nanoid() {
  return Math.random().toString(36).slice(2, 10);
}

function getInitials(email?: string) {
  if (!email) return "ME";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ChatShell() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!COGNITO_CONFIGURED) {
      setAuthChecked(true);
      return;
    }
    getCurrentUser()
      .then(() => fetchUserAttributes())
      .then((attrs) => setUserEmail(attrs.email ?? undefined))
      .catch(() => {
        // Not signed in — redirect to Cognito hosted UI
        const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
        const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
        if (domain && clientId) {
          const redirect = encodeURIComponent(window.location.origin + "/");
          window.location.href = `https://${domain}/login?client_id=${clientId}&response_type=code&scope=openid+email+profile&redirect_uri=${redirect}`;
        }
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { id: nanoid(), role: "user", content: trimmed };
      const placeholderId = nanoid();
      const placeholder: Message = { id: placeholderId, role: "assistant", content: "", loading: true };

      setMessages((prev) => [...prev, userMsg, placeholder]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, sessionId }),
        });

        const data: { answer: string; sources: ChatSource[]; sessionId: string; error?: string } =
          await res.json();

        if (!res.ok) throw new Error(data.error ?? "Unknown error");

        if (data.sessionId) setSessionId(data.sessionId);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { ...m, content: data.answer, sources: data.sources, loading: false }
              : m
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { ...m, content: `Sorry, I encountered an error: ${msg}`, loading: false }
              : m
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionId]
  );

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[oklch(0.09_0.025_240)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.22_260)] flex items-center justify-center animate-pulse">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <path d="M14 3C8.48 3 4 7.48 4 13c0 2.39.86 4.58 2.27 6.29L4 25l5.71-2.27C11.42 23.89 12.69 24.2 14 24.2c5.52 0 10-4.48 10-10S19.52 3 14 3z" fill="white"/>
            </svg>
          </div>
          <p className="text-sm text-[oklch(0.55_0.05_240)]">Loading ProductIQ…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[oklch(0.09_0.025_240)]">
      <ChatHeader userEmail={userEmail} />
      <MessageThread
        messages={messages}
        onSuggestion={sendMessage}
        userInitials={getInitials(userEmail)}
      />
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={() => sendMessage(input)}
        loading={loading}
      />
    </div>
  );
}
