"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LANG_META, Lang } from "@/lib/i18n";

const ORDER: Lang[] = ["hi", "mr", "gu", "en"];
const FLAGS: Record<Lang, string> = { hi: "🇮🇳", mr: "🟧", gu: "🟦", en: "🔤" };

export default function Home() {
  const router = useRouter();
  const pick = (c: Lang) => { localStorage.setItem("lang", c); router.push("/profile"); };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[140px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/5 rounded-full blur-[160px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
          className="text-7xl mb-5">🏛️</motion.div>
        <h1 className="text-5xl font-bold gradient-text">SarkarSathi</h1>
        <p className="font-display text-3xl text-foreground/80 mt-2">सरकार साथी</p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary">
          <Sparkles className="w-3 h-3" /> AI Voice Assistant
        </div>
      </motion.div>

      <motion.p className="text-sm text-muted-foreground mb-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        Choose your language • अपनी भाषा चुनें
      </motion.p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {ORDER.map((c, i) => {
          const m = LANG_META[c];
          return (
            <motion.button key={c}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => pick(c)}
              className="relative aspect-square bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/10 transition group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition" />
              <div className="text-4xl relative z-10">{FLAGS[c]}</div>
              <div className="font-display text-2xl relative z-10">{m.native}</div>
              <div className="text-xs text-muted-foreground relative z-10">{m.name}</div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-8">No login required</p>
    </main>
  );
}
