"use client";
import { useRouter } from "next/navigation";
import schemesData from "@/data/schemes.json";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useLang } from "@/hooks/useLang";

const STATES_BY_LANG: Record<string, { name: string; native: string; lang: string; emoji: string; color: string }[]> = {
  en: [
    { name: "Maharashtra", native: "Maharashtra", lang: "Marathi", emoji: "🟧", color: "#FF6B35" },
    { name: "Uttar Pradesh", native: "Uttar Pradesh", lang: "Hindi", emoji: "🟢", color: "#22C55E" },
    { name: "Gujarat", native: "Gujarat", lang: "Gujarati", emoji: "🟦", color: "#3B82F6" },
    { name: "Rajasthan", native: "Rajasthan", lang: "Hindi", emoji: "🟡", color: "#FACC15" },
    { name: "Bihar", native: "Bihar", lang: "Hindi", emoji: "🔴", color: "#EF4444" },
  ],
  hi: [
    { name: "Maharashtra", native: "महाराष्ट्र", lang: "मराठी", emoji: "🟧", color: "#FF6B35" },
    { name: "Uttar Pradesh", native: "उत्तर प्रदेश", lang: "हिन्दी", emoji: "🟢", color: "#22C55E" },
    { name: "Gujarat", native: "गुजरात", lang: "गुजराती", emoji: "🟦", color: "#3B82F6" },
    { name: "Rajasthan", native: "राजस्थान", lang: "हिन्दी", emoji: "🟡", color: "#FACC15" },
    { name: "Bihar", native: "बिहार", lang: "हिन्दी", emoji: "🔴", color: "#EF4444" },
  ],
  mr: [
    { name: "Maharashtra", native: "महाराष्ट्र", lang: "मराठी", emoji: "🟧", color: "#FF6B35" },
    { name: "Uttar Pradesh", native: "उत्तर प्रदेश", lang: "हिंदी", emoji: "🟢", color: "#22C55E" },
    { name: "Gujarat", native: "गुजरात", lang: "गुजराती", emoji: "🟦", color: "#3B82F6" },
    { name: "Rajasthan", native: "राजस्थान", lang: "हिंदी", emoji: "🟡", color: "#FACC15" },
    { name: "Bihar", native: "बिहार", lang: "हिंदी", emoji: "🔴", color: "#EF4444" },
  ],
  gu: [
    { name: "Maharashtra", native: "મહારાષ્ટ્ર", lang: "મરાઠી", emoji: "🟧", color: "#FF6B35" },
    { name: "Uttar Pradesh", native: "ઉત્તર પ્રદેશ", lang: "હિન્દી", emoji: "🟢", color: "#22C55E" },
    { name: "Gujarat", native: "ગુજરાત", lang: "ગુજરાતી", emoji: "🟦", color: "#3B82F6" },
    { name: "Rajasthan", native: "રાજસ્થાન", lang: "હિન્દી", emoji: "🟡", color: "#FACC15" },
    { name: "Bihar", native: "બિહાર", lang: "હિન્દી", emoji: "🔴", color: "#EF4444" },
  ],
};

import { ElegantShape } from "@/components/ui/shape-landing-hero";

export default function StateSelect() {
  const router = useRouter();
  const { t, lang } = useLang();
  const data: any = schemesData;
  const STATES = STATES_BY_LANG[lang] || STATES_BY_LANG.en;
  const pick = (s: string) => { localStorage.setItem("state", s); router.push("/mode"); };

  return (
    <main className="min-h-screen p-6 lg:p-10 max-w-6xl mx-auto fade-up relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/[0.05] via-transparent to-[#138808]/[0.05] blur-3xl" />
        <ElegantShape
          delay={0.3}
          width={400}
          height={100}
          rotate={12}
          gradient="from-[#FF9933]/[0.08]"
          className="left-[-10%] top-[10%]"
        />
        <ElegantShape
          delay={0.5}
          width={300}
          height={80}
          rotate={-15}
          gradient="from-[#138808]/[0.08]"
          className="right-[-5%] bottom-[20%]"
        />
      </div>

      <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-500 mb-6 text-sm hover:text-slate-900 transition-colors group font-semibold">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t.back}
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 text-slate-800 tracking-tight">{t.selectState}</h1>
        <p className="text-base text-slate-400 font-medium">{t.statePersonal}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {STATES.map((s, i) => {
          const count = (data[s.name]?.schemes?.length ?? 0);
          return (
            <motion.button key={s.name}
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => pick(s.name)}
              className="text-left glass border border-white/10 rounded-3xl p-6 hover:shadow-2xl hover:border-primary/40 transition-all relative overflow-hidden group shadow-lg"
              style={{ borderLeft: `8px solid ${s.color}` }}>
              
              {/* Internal card glow */}
              <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full opacity-20 group-hover:opacity-40 transition-all duration-500 blur-2xl" style={{ background: s.color }} />
              
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{s.emoji}</div>
              <div className="font-display text-2xl font-bold tracking-tight text-white mb-1 drop-shadow-sm">{s.native}</div>
              <div className="text-[10px] text-white/50 mt-1.5 font-black uppercase tracking-widest leading-none">
                {s.lang} <span className="mx-1">•</span> {count} {t.stateSchemes}
              </div>
            </motion.button>
          );
        })}
      </div>
    </main>
  );
}
