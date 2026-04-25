"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const langs = [
  { code: "hi", label: "हिन्दी", emoji: "🇮🇳", sub: "Hindi" },
  { code: "mr", label: "मराठी", emoji: "🟧", sub: "Marathi" },
  { code: "gu", label: "ગુજરાતી", emoji: "🟦", sub: "Gujarati" },
  { code: "en", label: "English", emoji: "🔤", sub: "English" },
];

export default function Home() {
  const router = useRouter();
  const pick = (c: string) => {
    localStorage.setItem("lang", c);
    router.push("/profile");
  };
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10">
        <div className="text-6xl mb-4">🏛️</div>
        <h1 className="text-4xl font-bold gradient-text">SarkarSathi</h1>
        <p className="font-display text-2xl text-foreground/80 mt-2">सरकार साथी</p>
        <p className="text-sm text-muted-foreground mt-4 max-w-md">
          AI voice assistant for Indian government schemes & services
        </p>
        <p className="text-xs text-muted-foreground mt-1">No login required</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {langs.map((l, i) => (
          <motion.button key={l.code}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => pick(l.code)}
            className="aspect-square bg-surface border border-border rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition">
            <div className="text-4xl">{l.emoji}</div>
            <div className="font-display text-xl">{l.label}</div>
            <div className="text-xs text-muted-foreground">{l.sub}</div>
          </motion.button>
        ))}
      </div>
    </main>
  );
}
