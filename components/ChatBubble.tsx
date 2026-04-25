"use client";
import { useState } from "react";
import { Volume2, VolumeX, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatBubble({
  role, text, time, onReadAloud, speaking, readLabel = "Read aloud", stopLabel = "Stop",
}: {
  role: "user" | "assistant"; text: string; time?: string;
  onReadAloud?: () => void; speaking?: boolean;
  readLabel?: string; stopLabel?: string;
}) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={cn("flex w-full items-end gap-2", isUser ? "justify-end" : "justify-start", isUser ? "msg-user" : "msg-assistant")}>

      {/* Avatar — assistant only */}
      {!isUser && (
        <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-r from-primary via-white to-secondary flex items-center justify-center text-sm shadow-md border border-black/5 mb-1">
          🏛️
        </div>
      )}

      <div className={cn(
        "group max-w-[85%] rounded-[1.25rem] px-5 py-4 text-sm leading-relaxed shadow-sm relative transition-all",
        isUser
          ? "bg-gradient-to-r from-primary via-white to-secondary text-slate-800 rounded-br-none border border-black/5"
          : "bg-white text-slate-700 rounded-bl-none border border-slate-100 shadow-sm"
      )}>

        {/* Markdown-like line breaks */}
        <div className="whitespace-pre-wrap font-medium">{text}</div>

        {/* Footer: time + actions */}
        <div className={cn(
          "mt-2 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider",
          isUser ? "text-slate-800/50 justify-end" : "text-slate-400 justify-start"
        )}>
          {time && <span className="opacity-70">{time}</span>}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-primary",
              isUser ? "text-slate-800/50 hover:text-slate-900" : "text-slate-400 hover:text-primary"
            )}
            title="Copy message"
          >
            {copied
              ? <Check className="w-3 h-3 text-secondary" />
              : <Copy className="w-3 h-3" />}
          </button>

          {/* Read aloud button — assistant only */}
          {!isUser && onReadAloud && (
            <button
              onClick={onReadAloud}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 hover:text-primary"
            >
              {speaking
                ? <VolumeX className="w-3 h-3 text-primary" />
                : <Volume2 className="w-3 h-3" />}
              <span className="tracking-tight">{speaking ? stopLabel : readLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Avatar — user only */}
      {isUser && (
        <div className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm mb-1 shadow-sm">
          👤
        </div>
      )}
    </div>
  );
}
