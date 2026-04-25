"use client";
import { useEffect, useState } from "react";
import { Accessibility, Type, TurtleIcon, Contrast, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 glass-strong border border-white/10 rounded-2xl p-4 space-y-3 w-64 shadow-2xl origin-bottom-right"
          >
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">Accessibility</span>
            </div>
            <Toggle label="Large Text" icon={<Type className="w-4 h-4" />} on={largeText} setOn={setLargeText} />
            <Toggle label="Slow Speech" icon={<TurtleIcon className="w-4 h-4" />} on={slowSpeech} setOn={setSlowSpeech} />
            <Toggle label="High Contrast" icon={<Contrast className="w-4 h-4" />} on={highContrast} setOn={setHighContrast} />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-orange-500 text-black flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30"
        aria-label="Accessibility settings"
      >
        {open ? <X className="w-6 h-6" /> : <Accessibility className="w-6 h-6" />}
      </button>
    </div>
  );
}

function Toggle({ label, icon, on, setOn }: { label: string; icon: React.ReactNode; on: boolean; setOn: (v: boolean) => void }) {
  return (
    <button
      onClick={() => setOn(!on)}
      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm transition-all duration-200 ${
        on
          ? "bg-primary text-black font-medium shadow-md shadow-primary/20"
          : "bg-black/20 hover:bg-black/30 border border-white/5 text-foreground/80 hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className={on ? "text-black/70" : "text-muted-foreground"}>{icon}</span>
        {label}
      </span>
      <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${on ? "bg-black/20" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${on ? "right-0.5" : "left-0.5"}`} />
      </div>
    </button>
  );
}
