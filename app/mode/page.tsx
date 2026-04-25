"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

export default function Mode() {
  const router = useRouter();
  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto fade-up">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground mb-4 text-sm hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-3xl font-semibold mb-2">What do you need?</h1>
      <p className="text-sm text-muted-foreground mb-10">Choose a mode to continue</p>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "Find Schemes", emoji: "🎯", desc: "Discover benefits you qualify for", path: "/chat/schemes", grad: "from-orange-500/30 to-amber-500/10" },
          { title: "Access Services", emoji: "📋", desc: "Get help with government processes", path: "/chat/services", grad: "from-rose-500/30 to-orange-500/10" },
        ].map((m, i) => (
          <motion.button key={m.title}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => router.push(m.path)}
            className={`relative bg-gradient-to-br ${m.grad} bg-surface border border-border rounded-2xl p-8 text-left hover:border-primary transition group overflow-hidden`}>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none"
              style={{ boxShadow: "inset 0 0 50px rgba(247,148,29,0.15)" }} />
            <div className="text-6xl mb-4">{m.emoji}</div>
            <h2 className="text-2xl font-semibold mb-2">{m.title}</h2>
            <p className="text-sm text-muted-foreground">{m.desc}</p>
          </motion.button>
        ))}
      </div>
    </main>
  );
}
