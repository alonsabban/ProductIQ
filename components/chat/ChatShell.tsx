"use client";

import { useState, useCallback, useEffect } from "react";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { configureAmplify, COGNITO_CONFIGURED, isOAuthCallback } from "@/lib/auth";
import { SessionSidebar, type ChatSession } from "./SessionSidebar";
import { MessageThread } from "./MessageThread";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { AboutModal } from "./AboutModal";
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

function makeSession(title = "New conversation"): ChatSession {
  return { id: nanoid(), title, createdAt: Date.now() };
}

interface SessionData {
  session: ChatSession;
  messages: Message[];
  bedrockSessionId?: string;
}

export function ChatShell() {
  const firstSession = makeSession();
  const [sessionMap, setSessionMap] = useState<Record<string, SessionData>>({
    [firstSession.id]: { session: firstSession, messages: [], bedrockSessionId: undefined },
  });
  const [activeId, setActiveId] = useState(firstSession.id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [authChecked, setAuthChecked] = useState(false);
  const [authStatus, setAuthStatus] = useState("Initialising…");

  useEffect(() => {
    if (!COGNITO_CONFIGURED) { setAuthChecked(true); return; }

    function redirectToLogin() {
      const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
      if (domain && clientId) {
        const redirect = encodeURIComponent(window.location.origin + "/");
        window.location.href = `https://${domain}/login?client_id=${clientId}&response_type=code&scope=openid+email+profile&redirect_uri=${redirect}`;
      }
    }

    async function checkAuth() {
      const onCallback = isOAuthCallback();
      const maxAttempts = onCallback ? 10 : 1;
      const delay = 600;

      if (onCallback) setAuthStatus("Processing login…");

      for (let i = 0; i < maxAttempts; i++) {
        if (onCallback && i > 0) setAuthStatus(`Verifying session (${i}/${maxAttempts})…`);
        try {
          await getCurrentUser();
          setAuthStatus("Loading…");
          const attrs = await fetchUserAttributes();
          setUserEmail(attrs.email ?? undefined);
          if (onCallback) {
            window.history.replaceState({}, "", window.location.pathname);
          }
          setAuthChecked(true);
          return;
        } catch {
          if (i < maxAttempts - 1) {
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }
      setAuthStatus("Redirecting to login…");
      await new Promise((r) => setTimeout(r, 1500)); // pause so user can read the message
      redirectToLogin();
    }

    checkAuth();
  }, []);

  const activeData = sessionMap[activeId];
  const sessions = Object.values(sessionMap)
    .map((d) => d.session)
    .sort((a, b) => b.createdAt - a.createdAt);

  function newSession() {
    const s = makeSession();
    setSessionMap((prev) => ({
      ...prev,
      [s.id]: { session: s, messages: [], bedrockSessionId: undefined },
    }));
    setActiveId(s.id);
    setInput("");
  }

  function deleteSession(id: string) {
    setSessionMap((prev) => {
      const next = { ...prev };
      delete next[id];
      if (Object.keys(next).length === 0) {
        const s = makeSession();
        next[s.id] = { session: s, messages: [], bedrockSessionId: undefined };
        setActiveId(s.id);
      } else if (id === activeId) {
        setActiveId(Object.keys(next)[0]);
      }
      return next;
    });
  }

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { id: nanoid(), role: "user", content: trimmed };
      const placeholderId = nanoid();
      const placeholder: Message = { id: placeholderId, role: "assistant", content: "", loading: true };

      // Auto-title the session from the first message
      setSessionMap((prev) => {
        const d = prev[activeId];
        const isFirstMessage = d.messages.length === 0;
        const title = isFirstMessage
          ? trimmed.slice(0, 40) + (trimmed.length > 40 ? "…" : "")
          : d.session.title;
        return {
          ...prev,
          [activeId]: {
            ...d,
            session: { ...d.session, title },
            messages: [...d.messages, userMsg, placeholder],
          },
        };
      });

      setInput("");
      setLoading(true);

      try {
        const bedrockSessionId = sessionMap[activeId]?.bedrockSessionId;
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, sessionId: bedrockSessionId }),
        });

        const data: { answer: string; sources: ChatSource[]; sessionId: string; error?: string } =
          await res.json();

        if (!res.ok) throw new Error(data.error ?? "Unknown error");

        setSessionMap((prev) => {
          const d = prev[activeId];
          return {
            ...prev,
            [activeId]: {
              ...d,
              bedrockSessionId: data.sessionId || d.bedrockSessionId,
              messages: d.messages.map((m) =>
                m.id === placeholderId
                  ? { ...m, content: data.answer, sources: data.sources, loading: false }
                  : m
              ),
            },
          };
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setSessionMap((prev) => {
          const d = prev[activeId];
          return {
            ...prev,
            [activeId]: {
              ...d,
              messages: d.messages.map((m) =>
                m.id === placeholderId
                  ? { ...m, content: `Sorry, I encountered an error: ${msg}`, loading: false }
                  : m
              ),
            },
          };
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, activeId, sessionMap]
  );

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f4f9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#1a56db] flex items-center justify-center animate-pulse">
            <MessageSquareIcon />
          </div>
          <p className="text-base text-[#4a6889]">{authStatus}</p>
          <a href="/debug" className="text-xs text-[#9ab0c8] underline mt-1">auth debug</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f0f4f9] overflow-hidden">
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      <SessionSidebar
        sessions={sessions}
        activeId={activeId}
        collapsed={sidebarCollapsed}
        onSelect={setActiveId}
        onNew={newSession}
        onDelete={deleteSession}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        onAbout={() => setShowAbout(true)}
        userEmail={userEmail}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          title={activeData?.session.title ?? "New conversation"}
          userEmail={userEmail}
          userInitials={getInitials(userEmail)}
          onNewSession={newSession}
          showNewButton={sidebarCollapsed}
        />
        <MessageThread
          messages={activeData?.messages ?? []}
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
    </div>
  );
}

function MessageSquareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
