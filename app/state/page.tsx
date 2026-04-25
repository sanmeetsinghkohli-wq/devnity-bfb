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

export default function StateSelect() {
  const router = useRouter();
  const { t, lang } = useLang();
  const data: any = schemesData;
  const STATES = STATES_BY_LANG[lang] || STATES_BY_LANG.en;
  const pick = (s: string) => { localStorage.setItem("state", s); router.push("/mode"); };

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto fade-up relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-[120px]" />
      </div>
      <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground mb-4 text-sm hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> {t.back}
      </button>
      <h1 className="text-3xl font-semibold mb-2">{t.selectState}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t.statePersonal}</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {STATES.map((s, i) => {
          const count = (data[s.name]?.schemes?.length ?? 0);
          return (
            <motion.button key={s.name}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              onClick={() => pick(s.name)}
              className="text-left bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:shadow-2xl transition-all relative overflow-hidden group"
              style={{ borderLeft: `4px solid ${s.color}` }}>
              <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-30 transition" style={{ background: s.color }} />
              <div className="text-3xl mb-2">{s.emoji}</div>
              <div className="font-display text-xl">{s.native}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.lang} • {count} {t.stateSchemes}</div>
            </motion.button>
          );
        })}
      </div>
    </main>
  );
}
