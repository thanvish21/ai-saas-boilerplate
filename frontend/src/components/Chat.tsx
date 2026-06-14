"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import type { Message } from "@/types";

interface Display {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Display[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content || streaming) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }, { role: "assistant", content: "" }]);
    setStreaming(true);

    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversationId, content }),
    });

    if (!res.ok || !res.body) {
      setStreaming(false);
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `[error] ${res.status} ${res.statusText}`,
        };
        return copy;
      });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      const frames = buf.split("\n\n");
      buf = frames.pop() ?? "";

      for (const frame of frames) {
        if (!frame.trim()) continue;
        const lines = frame.split("\n");
        let event = "message";
        let data = "";
        for (const line of lines) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (event === "conversation") {
          try {
            const parsed = JSON.parse(data) as { id: string };
            setConversationId(parsed.id);
          } catch {}
        } else if (event === "delta") {
          try {
            const parsed = JSON.parse(data) as { delta: string };
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last?.role === "assistant") {
                copy[copy.length - 1] = { role: "assistant", content: last.content + parsed.delta };
              }
              return copy;
            });
          } catch {}
        } else if (event === "error") {
          try {
            const parsed = JSON.parse(data) as { message: string };
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: `[error] ${parsed.message}` };
              return copy;
            });
          } catch {}
        }
      }
    }

    setStreaming(false);
  }

  if (!session) {
    return <div className="p-8 text-slate-400">Please sign in.</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-slate-400">
              Ask Claude anything.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[80%] rounded-2xl bg-brand-500 px-4 py-3 text-white"
                  : "mr-auto max-w-[80%] whitespace-pre-wrap rounded-2xl bg-slate-800 px-4 py-3"
              }
            >
              {m.content || (m.role === "assistant" && streaming ? "…" : "")}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="border-t border-slate-800 p-4"
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Claude…"
            disabled={streaming}
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-brand-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
