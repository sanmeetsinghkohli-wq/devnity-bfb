"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import { useLang } from "@/hooks/useLang";
import MicButton from "@/components/MicButton";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Sparkles } from "lucide-react";

import { ElegantShape } from "@/components/ui/shape-landing-hero";

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
      }, 500);
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
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/[0.03] via-transparent to-[#138808]/[0.03] blur-3xl" />
        <ElegantShape
          delay={0.3}
          width={400}
          height={100}
          rotate={12}
          gradient="from-[#FF9933]/[0.1]"
          className="left-[-10%] top-[10%]"
        />
        <ElegantShape
          delay={0.5}
          width={300}
          height={80}
          rotate={-15}
          gradient="from-[#138808]/[0.1]"
          className="right-[-5%] bottom-[20%]"
        />
        <ElegantShape
          delay={0.4}
          width={200}
          height={60}
          rotate={-8}
          gradient="from-[#000080]/[0.08]"
          className="left-[10%] bottom-[10%]"
        />
      </div>

      <header className="flex justify-between items-center mb-10 w-full relative z-10 pt-2">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-500 text-sm hover:text-slate-900 transition-colors group font-medium">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t.back}
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-600">
          <User className="w-3.5 h-3.5 text-primary" /> Profile Setup
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mb-10 w-full max-w-md mx-auto">
        <div className="flex justify-between text-[11px] text-slate-400 mb-3 font-bold uppercase tracking-wider">
          <span>Question {step + 1} of {QS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-[1px]">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-white to-secondary rounded-full relative" 
            animate={{ width: `${progress}%` }} 
            transition={{ ease: "easeInOut", duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-white/30 w-full h-full shimmer" />
          </motion.div>
        </div>
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full mx-auto pb-20">
        <div className="glass-strong rounded-[2.5rem] p-10 w-full border border-white shadow-2xl relative overflow-hidden">
          {/* Card subtle glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
          
          {/* Status indicators */}
          <div className="absolute top-8 right-8 flex gap-2">
            {v.speaking && <span className="flex items-center gap-1.5 text-primary text-[10px] uppercase tracking-widest font-black"><Sparkles className="w-3 h-3 animate-pulse" /> Speaking</span>}
            {v.listening && <span className="flex items-center gap-1.5 text-secondary text-[10px] uppercase tracking-widest font-black"><span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" /> Listening</span>}
          </div>

          <AnimatePresence mode="wait">
            <motion.h2 
              key={step} 
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} 
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold mb-10 leading-tight mt-6 text-white tracking-tight"
            >
              {QS[step].q}
            </motion.h2>
          </AnimatePresence>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 w-full">
              <MicButton active={v.listening} onStart={v.startListening} onStop={v.stopListening} />
              <input 
                value={text} 
                onChange={e => { setText(e.target.value); transcriptRef.current = e.target.value; }}
                onKeyDown={e => { if (e.key === "Enter" && text.trim()) next(text.trim()); }}
                placeholder={t.orType}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-white/30 font-medium text-white shadow-sm" 
              />
            </div>

            <div className="flex gap-3 mt-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => text.trim() && next(text.trim())} 
                disabled={!text.trim()}
                className="flex-1 bg-gradient-to-r from-primary via-white to-secondary text-slate-800 rounded-2xl py-4 font-bold shadow-xl shadow-primary/10 disabled:opacity-30 disabled:shadow-none transition-all border border-black/5"
              >
                {t.next}
              </motion.button>
              <button 
                onClick={skip} 
                className="px-8 rounded-2xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all font-bold text-sm"
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
