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
        <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm shadow-lg shadow-primary/20 mb-1">
          🏛️
        </div>
      )}

      <div className={cn(
        "group max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md relative",
        isUser
          ? "bg-gradient-to-br from-[#F7941D] to-[#FF5733] text-black rounded-br-sm"
          : "glass text-foreground rounded-bl-sm border-white/10"
      )}>

        {/* Markdown-like line breaks */}
        <div className="whitespace-pre-wrap">{text}</div>

        {/* Footer: time + actions */}
        <div className={cn(
          "mt-1.5 flex items-center gap-2 text-[10px]",
          isUser ? "text-black/60 justify-end" : "text-muted-foreground justify-start"
        )}>
          {time && <span>{time}</span>}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 hover:text-primary",
              isUser ? "text-black/50 hover:text-black" : "text-muted-foreground"
            )}
            title="Copy message"
          >
            {copied
              ? <Check className="w-3 h-3 text-success" />
              : <Copy className="w-3 h-3" />}
          </button>

          {/* Read aloud button — assistant only */}
          {!isUser && onReadAloud && (
            <button
              onClick={onReadAloud}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-primary"
            >
              {speaking
                ? <VolumeX className="w-3 h-3 text-primary" />
                : <Volume2 className="w-3 h-3" />}
              <span>{speaking ? stopLabel : readLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Avatar — user only */}
      {isUser && (
        <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-orange-400/20 to-rose-500/20 border border-primary/30 flex items-center justify-center text-sm mb-1">
          👤
        </div>
      )}
    </div>
  );
}
