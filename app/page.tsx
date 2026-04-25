"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Zap } from "lucide-react";
import { useEffect } from "react";
import { LANG_META, Lang } from "@/lib/i18n";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { useVoice } from "@/hooks/useVoice";
import MicButton from "@/components/MicButton";

const ORDER: Lang[] = ["hi", "mr", "gu", "en"];
const FLAGS: Record<Lang, string> = { hi: "🇮🇳", mr: "🟧", gu: "🟦", en: "🔤" };

export default function Home() {
  const router = useRouter();
  const pick = (c: Lang) => { localStorage.setItem("lang", c); router.push("/profile"); };
  const { startListening, stopListening, listening, transcript } = useVoice("en-IN");

  // Voice Language Selection Logic
  useEffect(() => {
    const t = transcript.toLowerCase();
    if (t.includes("hindi") || t.includes("हिंदी") || t.includes("हिन्दी")) pick("hi");
    if (t.includes("marathi") || t.includes("मराठी")) pick("mr");
    if (t.includes("gujarati") || t.includes("ગુજરાતી")) pick("gu");
    if (t.includes("english")) pick("en");
  }, [transcript]);

  return (
    <main className="min-h-screen">
      <HeroGeometric 
        badge="Official · Voice-First · Citizen-Led"
      >
        <div className="flex flex-col items-center mt-[-40px] z-20 relative">
          <motion.img 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            src="/logo.png" 
            alt="SarkarSathi Logo" 
            className="w-[280px] md:w-[380px] h-auto mb-6 drop-shadow-xl" 
          />

          <p className="text-sm md:text-lg text-slate-600 mb-8 max-w-md mx-auto leading-relaxed font-bold">
            Your voice-powered guide to <span className="text-primary">government schemes & services</span> — in your native language.
          </p>

          <div className="mb-8 flex flex-col items-center gap-3">
             <MicButton active={listening} onStart={startListening} onStop={stopListening} />
             <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${listening ? 'text-primary animate-pulse' : 'text-slate-400'}`}>
                {listening ? "Say your language..." : "Click to use Voice Selection"}
             </p>
          </div>

          <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest font-semibold">
            Choose your language · अपनी भाषा चुनें
          </p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
            {ORDER.map((c, i) => {
              const m = LANG_META[c];
              return (
                <motion.button
                  key={c}
                  initial={{ opacity: 0, scale: 0.85, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => pick(c)}
                  className="relative aspect-[4/3] bg-white rounded-2xl flex flex-col items-center justify-center gap-2 border border-black/5 hover:border-primary/60 transition-all duration-300 overflow-hidden group shadow-lg shadow-black/[0.02] hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                  <div className="text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{FLAGS[c]}</div>
                  <div className="font-display text-xl sm:text-2xl relative z-10 text-slate-800 font-medium">{m.native}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 relative z-10 font-semibold tracking-wider uppercase">{m.name}</div>
                  
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-primary transition-colors duration-200" />
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="flex items-center gap-5 text-[11px] sm:text-xs text-slate-500 font-medium"
          >
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500 mt-[-1px]" /> No login required</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary mt-[-1px]" /> Works offline</span>
          </motion.div>
        </div>
      </HeroGeometric>
    </main>
  );
}
