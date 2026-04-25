"use client";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatBubble({
  role, text, time, onReadAloud, speaking,
}: {
  role: "user" | "assistant"; text: string; time?: string;
  onReadAloud?: () => void; speaking?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow",
        isUser
          ? "bg-gradient-to-br from-[#F7941D] to-[#FF5733] text-black"
          : "bg-surface border border-border text-foreground"
      )}>
        <div className="whitespace-pre-wrap">{text}</div>
        <div className={cn("mt-1 flex items-center gap-2 text-[10px]", isUser ? "text-black/70" : "text-muted-foreground")}>
          {time && <span>{time}</span>}
          {!isUser && onReadAloud && (
            <button onClick={onReadAloud} className="flex items-center gap-1 hover:text-primary" aria-label="Read aloud">
              {speaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>{speaking ? "Stop" : "Read aloud"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
