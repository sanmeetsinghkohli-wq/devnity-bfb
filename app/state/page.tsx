"use client";
import { useRouter } from "next/navigation";
import schemesData from "@/data/schemes.json";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

const STATES = [
  { name: "Maharashtra", lang: "मराठी", emoji: "🟧", color: "#FF6B35" },
  { name: "Uttar Pradesh", lang: "हिन्दी", emoji: "🟢", color: "#22C55E" },
  { name: "Gujarat", lang: "ગુજરાતી", emoji: "🟦", color: "#3B82F6" },
  { name: "Rajasthan", lang: "हिन्दी", emoji: "🟡", color: "#FACC15" },
  { name: "Bihar", lang: "हिन्दी", emoji: "🔴", color: "#EF4444" },
];

export default function StateSelect() {
  const router = useRouter();
  const data: any = schemesData;
  const pick = (s: string) => { localStorage.setItem("state", s); router.push("/mode"); };

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto fade-up">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground mb-4 text-sm hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-3xl font-semibold mb-2">Select your state</h1>
      <p className="text-sm text-muted-foreground mb-8">We'll personalize schemes for you</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {STATES.map((s, i) => {
          const count = (data[s.name]?.schemes?.length ?? 0);
          return (
            <motion.button key={s.name}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => pick(s.name)}
              className="text-left bg-surface border border-border rounded-2xl p-4 hover:shadow-2xl transition-all relative overflow-hidden group"
              style={{ borderLeft: `4px solid ${s.color}` }}>
              <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition" style={{ background: s.color }} />
              <div className="text-3xl mb-2">{s.emoji}</div>
              <div className="font-semibold text-lg">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.lang} • {count} state schemes</div>
            </motion.button>
          );
        })}
      </div>
    </main>
  );
}
