"use client";
import { useEffect, useState } from "react";
import { Accessibility, Type, TurtleIcon, Contrast } from "lucide-react";

export default function AccessibilityFab() {
  const [open, setOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [slowSpeech, setSlowSpeech] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    setLargeText(localStorage.getItem("largeText") === "1");
    setSlowSpeech(localStorage.getItem("slowSpeech") === "1");
    setHighContrast(localStorage.getItem("highContrast") === "1");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("large-text", largeText);
    localStorage.setItem("largeText", largeText ? "1" : "0");
  }, [largeText]);
  useEffect(() => { localStorage.setItem("slowSpeech", slowSpeech ? "1" : "0"); }, [slowSpeech]);
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    localStorage.setItem("highContrast", highContrast ? "1" : "0");
  }, [highContrast]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 bg-surface border border-border rounded-xl p-3 space-y-2 w-56 shadow-2xl">
          <Toggle label="Large text" icon={<Type className="w-4 h-4" />} on={largeText} setOn={setLargeText} />
          <Toggle label="Slow speech" icon={<TurtleIcon className="w-4 h-4" />} on={slowSpeech} setOn={setSlowSpeech} />
          <Toggle label="High contrast" icon={<Contrast className="w-4 h-4" />} on={highContrast} setOn={setHighContrast} />
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg hover:scale-105 transition">
        <Accessibility className="w-5 h-5" />
      </button>
    </div>
  );
}

function Toggle({ label, icon, on, setOn }: { label: string; icon: React.ReactNode; on: boolean; setOn: (v: boolean) => void }) {
  return (
    <button onClick={() => setOn(!on)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs ${on ? "bg-primary/20 border border-primary text-primary" : "bg-background border border-border"}`}>
      <span className="flex items-center gap-2">{icon}{label}</span>
      <span className={`w-8 h-4 rounded-full relative ${on ? "bg-primary" : "bg-border"}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition ${on ? "right-0.5" : "left-0.5"}`} />
      </span>
    </button>
  );
}
