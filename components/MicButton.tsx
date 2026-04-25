"use client";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MicButton({
  active, onStart, onStop,
}: { active: boolean; onStart: () => void; onStop: () => void }) {
  return (
    <button
      type="button"
      onClick={() => (active ? onStop() : onStart())}
      className={cn(
        "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0",
        active
          ? "bg-gradient-to-r from-primary via-white to-secondary text-slate-800 mic-glow scale-110 shadow-xl border border-black/5"
          : "bg-white border border-slate-200 text-slate-500 hover:border-primary/60 hover:text-primary shadow-sm"
      )}
      aria-label={active ? "Stop recording" : "Start recording"}
    >
      {/* Pulse rings when active */}
      {active && (
        <>
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" style={{ animationDuration: "1.5s" }} />
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/15" style={{ animationDuration: "2s", animationDelay: "0.4s" }} />
        </>
      )}
      <span className="relative z-10">
        {active ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </span>
    </button>
  );
}
