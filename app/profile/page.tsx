"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import { useLang } from "@/hooks/useLang";
import MicButton from "@/components/MicButton";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Sparkles } from "lucide-react";

export default function Profile() {
  const router = useRouter();
  const { t, meta } = useLang();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const v = useVoice(meta.sttLang);

  const QS = [
    { key: "name", q: t.profileQ.name },
    { key: "age", q: t.profileQ.age },
    { key: "gender", q: t.profileQ.gender },
    { key: "income", q: t.profileQ.income },
    { key: "category", q: t.profileQ.category },
  ];

  const stepRef = useRef(step);
  const wasSpeaking = useRef(false);
  const wasListening = useRef(false);
  const transcriptRef = useRef("");
  const advancingRef = useRef(false);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { transcriptRef.current = v.transcript; setText(v.transcript); }, [v.transcript]);

  // Speak current question
  useEffect(() => {
    advancingRef.current = false;
    if (step < QS.length && t) {
      transcriptRef.current = "";
      setText("");
      const id = setTimeout(() => v.speak(QS[step].q, { lang: meta.ttsLang }), 250);
      return () => clearTimeout(id);
    }
  }, [step, meta.ttsLang]);

  // After AI finishes asking → auto-start listening
  useEffect(() => {
    const stopped = wasSpeaking.current && !v.speaking;
    wasSpeaking.current = v.speaking;
    if (stopped && !v.listening && stepRef.current < QS.length) {
      const id = setTimeout(() => { try { v.startListening(); } catch {} }, 300);
      return () => clearTimeout(id);
    }
  }, [v.speaking]);

  // After user finishes speaking → wait, then advance with whatever was captured
  useEffect(() => {
    const stopped = wasListening.current && !v.listening;
    wasListening.current = v.listening;
    if (stopped && !advancingRef.current) {
      const id = setTimeout(() => {
        const ans = transcriptRef.current.trim();
        if (ans) { advancingRef.current = true; next(ans); }
        else {
          // didn't catch anything — restart mic so user can try again
          try { v.startListening(); } catch {}
        }
      }, 1200);
      return () => clearTimeout(id);
    }
  }, [v.listening]);

  const next = (val: string) => {
    const k = QS[stepRef.current].key;
    const updated = { ...profile, [k]: val };
    setProfile(updated);
    setText(""); transcriptRef.current = "";
    
    // Stop any active mic/speaker so they reset perfectly for the next question
    v.stopSpeaking(); 
    v.stopListening();

    if (stepRef.current + 1 >= QS.length) {
      localStorage.setItem("profile", JSON.stringify(updated));
      router.push("/state");
    } else {
      setStep(stepRef.current + 1);
    }
  };
  const skip = () => next("");

  if (step >= QS.length) return null;
  const progress = ((step + 1) / QS.length) * 100;

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-xl mx-auto relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <header className="flex justify-between items-center mb-10 w-full relative z-10 pt-2">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t.back}
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">
          <User className="w-3.5 h-3.5 text-primary" /> Profile Setup
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mb-10 w-full max-w-md mx-auto">
        <div className="flex justify-between text-xs text-muted-foreground mb-3 font-medium">
          <span>Question {step + 1} of {QS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-white to-secondary relative" 
            animate={{ width: `${progress}%` }} 
            transition={{ ease: "easeInOut", duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full shimmer" />
          </motion.div>
        </div>
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full mx-auto pb-20">
        <div className="glass-strong rounded-3xl p-8 w-full border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Card subtle glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[60px] rounded-full" />
          
          {/* Status indicators */}
          <div className="absolute top-6 right-6 flex gap-2">
            {v.speaking && <span className="flex items-center gap-1.5 text-primary text-[10px] uppercase tracking-widest font-bold"><Sparkles className="w-3 h-3 animate-pulse" /> Speaking</span>}
            {v.listening && <span className="flex items-center gap-1.5 text-success text-[10px] uppercase tracking-widest font-bold"><span className="w-2 h-2 rounded-full bg-success animate-ping" /> Listening</span>}
          </div>

          <AnimatePresence mode="wait">
            <motion.h2 
              key={step} 
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} 
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold mb-8 leading-snug mt-6"
            >
              {QS[step].q}
            </motion.h2>
          </AnimatePresence>

          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-3 w-full">
              <MicButton active={v.listening} onStart={v.startListening} onStop={v.stopListening} />
              <input 
                value={text} 
                onChange={e => { setText(e.target.value); transcriptRef.current = e.target.value; }}
                onKeyDown={e => { if (e.key === "Enter" && text.trim()) next(text.trim()); }}
                placeholder={t.orType}
                className="flex-1 bg-black/20 backdrop-blur border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-white/20" 
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => text.trim() && next(text.trim())} 
                disabled={!text.trim()}
                className="flex-1 bg-gradient-to-r from-primary via-white to-secondary text-black rounded-xl py-3.5 font-bold shadow-lg shadow-primary/20 disabled:opacity-40 disabled:shadow-none hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {t.next}
              </button>
              <button 
                onClick={skip} 
                className="px-6 rounded-xl border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors font-medium"
              >
                {t.skip}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
