"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from "aws-amplify/auth";
import { configureAmplify } from "@/lib/auth";

configureAmplify();

interface LogEntry {
  ts: string;
  level: "info" | "ok" | "error";
  msg: string;
}

function ts() {
  return new Date().toISOString().slice(11, 23);
}

export default function DebugPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  function log(level: LogEntry["level"], msg: string) {
    setLogs((prev) => [...prev, { ts: ts(), level, msg }]);
  }

  useEffect(() => {
    async function run() {
      // 1. Env vars
      log("info", `COGNITO_CONFIGURED: ${!!(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID && process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID)}`);
      log("info", `USER_POOL_ID: ${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "NOT SET"}`);
      log("info", `CLIENT_ID: ${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "NOT SET"}`);
      log("info", `DOMAIN: ${process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "NOT SET"}`);

      // 2. URL params
      const params = new URLSearchParams(window.location.search);
      log("info", `URL has ?code: ${params.has("code")}`);
      log("info", `URL has ?error: ${params.has("error")}`);
      if (params.has("error")) {
        log("error", `OAuth error: ${params.get("error")} — ${params.get("error_description")}`);
      }

      // 3. getCurrentUser
      log("info", "Calling getCurrentUser()...");
      try {
        const user = await getCurrentUser();
        log("ok", `getCurrentUser OK: ${JSON.stringify(user)}`);
      } catch (e) {
        log("error", `getCurrentUser failed: ${String(e)}`);
      }

      // 4. fetchAuthSession
      log("info", "Calling fetchAuthSession()...");
      try {
        const session = await fetchAuthSession();
        const hasTokens = !!(session.tokens?.accessToken);
        log(hasTokens ? "ok" : "error", `fetchAuthSession: tokens present = ${hasTokens}`);
        if (session.tokens?.idToken) {
          const payload = session.tokens.idToken.payload;
          log("ok", `idToken sub: ${payload.sub}`);
          log("ok", `idToken email: ${payload.email}`);
        }
      } catch (e) {
        log("error", `fetchAuthSession failed: ${String(e)}`);
      }

      // 5. fetchUserAttributes
      log("info", "Calling fetchUserAttributes()...");
      try {
        const attrs = await fetchUserAttributes();
        log("ok", `email: ${attrs.email}`);
      } catch (e) {
        log("error", `fetchUserAttributes failed: ${String(e)}`);
      }

      log("info", "Done.");
    }

    run();
  }, []);

  return (
    <div style={{ fontFamily: "monospace", padding: "24px", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" }}>
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <strong style={{ fontSize: "18px", color: "#60a5fa" }}>ProductIQ — Auth Debug</strong>
        <a href="/" style={{ color: "#94a3b8", fontSize: "13px" }}>← back to app</a>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {logs.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
            <span style={{ color: "#475569", minWidth: "90px" }}>{l.ts}</span>
            <span style={{
              minWidth: "45px",
              color: l.level === "ok" ? "#4ade80" : l.level === "error" ? "#f87171" : "#94a3b8"
            }}>
              {l.level === "ok" ? "✓ OK" : l.level === "error" ? "✗ ERR" : "•"}
            </span>
            <span style={{ color: l.level === "error" ? "#fca5a5" : "#e2e8f0", wordBreak: "break-all" }}>
              {l.msg}
            </span>
          </div>
        ))}
        {logs.length === 0 && <span style={{ color: "#475569" }}>Running checks…</span>}
      </div>
    </div>
  );
}
