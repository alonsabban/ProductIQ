"use client";

import { useEffect, useRef } from "react";
import { MessageBubble, type Message } from "./MessageBubble";
import { SuggestedQuestions } from "./SuggestedQuestions";

interface MessageThreadProps {
  messages: Message[];
  onSuggestion: (q: string) => void;
  userInitials: string;
}

export function MessageThread({ messages, onSuggestion, userInitials }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <SuggestedQuestions onSelect={onSuggestion} />
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} userInitials={userInitials} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
