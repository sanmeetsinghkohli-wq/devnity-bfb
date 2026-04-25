"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Target, ClipboardList } from "lucide-react";
import { useLang } from "@/hooks/useLang";

export default function Mode() {
  const router = useRouter();
  const { t } = useLang();
  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto fade-up relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[140px]" />
      </div>

      <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground mb-4 text-sm hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> {t.back}
      </button>
      <h1 className="text-3xl font-semibold mb-2">{t.whatNeed}</h1>
      <p className="text-sm text-muted-foreground mb-10">{t.chooseMode}</p>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: t.findSchemes, Icon: Target, desc: t.findSchemesDesc, path: "/chat/schemes", grad: "from-orange-500/30 via-amber-500/10 to-transparent" },
          { title: t.accessServices, Icon: ClipboardList, desc: t.accessServicesDesc, path: "/chat/services", grad: "from-rose-500/30 via-orange-500/10 to-transparent" },
        ].map((m, i) => (
          <motion.button key={m.title}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => router.push(m.path)}
            className={`relative bg-gradient-to-br ${m.grad} bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-7 text-left hover:border-primary transition group overflow-hidden min-h-[220px]`}>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none"
              style={{ boxShadow: "inset 0 0 60px rgba(247,148,29,0.2)" }} />
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
              <m.Icon className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">{m.title}</h2>
            <p className="text-sm text-muted-foreground">{m.desc}</p>
          </motion.button>
        ))}
      </div>
    </main>
  );
}
