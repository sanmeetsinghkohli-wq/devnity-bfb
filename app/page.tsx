"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Shield, Users, Zap, Globe } from "lucide-react";
import { LANG_META, Lang } from "@/lib/i18n";

const ORDER: Lang[] = ["hi", "mr", "gu", "en"];
const FLAGS: Record<Lang, string> = { hi: "🇮🇳", mr: "🟧", gu: "🟦", en: "🔤" };

const STATS = [
  { icon: Users, value: "2Cr+", label: "Citizens helped" },
  { icon: Globe,  value: "500+", label: "Schemes covered" },
  { icon: Zap,    value: "4",    label: "Languages" },
  { icon: Shield, value: "100%", label: "Free & private" },
];

export default function Home() {
  const router = useRouter();
  const pick = (c: Lang) => { localStorage.setItem("lang", c); router.push("/profile"); };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* ── Ambient orbs ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="float-orb absolute -top-32 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[140px]" />
        <div className="float-orb-slow absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/4 rounded-full blur-[180px]" />
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10 relative"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-xs text-primary font-medium tracking-wide"
        >
          <Sparkles className="w-3 h-3" />
          AI-Powered · Voice-First · Free Forever
        </motion.div>

        {/* Logo */}
        <motion.div
          animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl mb-4 drop-shadow-2xl select-none"
        >🏛️</motion.div>

        <h1 className="text-6xl font-bold gradient-text tracking-tight">SarkarSathi</h1>
        <p className="font-display text-3xl text-foreground/70 mt-2 tracking-wide">सरकार साथी</p>
        <p className="mt-4 text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Your voice-powered guide to{" "}
          <span className="text-primary font-medium">government schemes & services</span> — in your language
        </p>
      </motion.div>

      {/* ── Stats strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-1 mb-10 glass rounded-2xl px-2 py-2"
      >
        {STATS.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center px-4 py-1 text-center min-w-[72px]">
              <s.icon className="w-3.5 h-3.5 text-primary mb-1" />
              <span className="text-sm font-bold text-foreground">{s.value}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{s.label}</span>
            </div>
            {i < STATS.length - 1 && <div className="w-px h-8 bg-white/8" />}
          </div>
        ))}
      </motion.div>

      {/* ── Language chooser ── */}
      <motion.p
        className="text-xs text-muted-foreground mb-3 uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Choose your language · अपनी भाषा चुनें
      </motion.p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {ORDER.map((c, i) => {
          const m = LANG_META[c];
          return (
            <motion.button
              key={c}
              initial={{ opacity: 0, scale: 0.85, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => pick(c)}
              className="relative aspect-square glass rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/60 transition-all duration-200 overflow-hidden group"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ boxShadow: "inset 0 0 40px rgba(247,148,29,0.12)" }} />

              <div className="text-4xl relative z-10 group-hover:scale-110 transition-transform duration-200">{FLAGS[c]}</div>
              <div className="font-display text-2xl relative z-10 text-foreground">{m.native}</div>
              <div className="text-[11px] text-muted-foreground relative z-10 font-medium tracking-wide">{m.name}</div>

              {/* Corner accent */}
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-200" />
            </motion.button>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex items-center gap-4 text-xs text-muted-foreground"
      >
        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-success" /> No login required</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Works offline</span>
      </motion.div>
    </main>
  );
}
