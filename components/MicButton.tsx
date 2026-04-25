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
        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
        active
          ? "bg-primary text-black mic-glow animate-pulseGlow"
          : "bg-surface border border-border text-foreground hover:border-primary"
      )}
      aria-label={active ? "Stop recording" : "Start recording"}
    >
      {active ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}
