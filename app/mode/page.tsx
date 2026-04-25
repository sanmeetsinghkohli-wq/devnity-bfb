"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Target, ClipboardList, Home } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { ElegantShape } from "@/components/ui/shape-landing-hero";

export default function Mode() {
  const router = useRouter();
  const { t } = useLang();
  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto fade-up relative">
      {/* ── Background decoration ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/[0.03] via-transparent to-[#138808]/[0.03] blur-3xl" />
        <ElegantShape
          delay={0.3}
          width={500}
          height={120}
          rotate={12}
          gradient="from-[#FF9933]/[0.08]"
          className="left-[-15%] top-[10%]"
        />
        <ElegantShape
          delay={0.5}
          width={300}
          height={80}
          rotate={-15}
          gradient="from-[#138808]/[0.08]"
          className="right-[-10%] top-[30%]"
        />
        <ElegantShape
          delay={0.4}
          width={250}
          height={70}
          rotate={-8}
          gradient="from-[#000080]/[0.06]"
          className="left-[5%] bottom-[15%]"
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-500 text-sm hover:text-slate-900 transition-colors w-fit group font-medium">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t.back}
        </button>
        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-slate-500 text-sm hover:text-slate-900 transition-colors w-fit group font-bold uppercase tracking-widest">
          <Home className="w-3.5 h-3.5" /> {t.home}
        </button>
      </div>

      <div className="mb-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black mb-3 tracking-tight text-slate-900"
        >
          {t.whatNeed}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-600 text-lg font-medium"
        >
          {t.chooseMode}
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 relative z-10">
        {[
          { 
            title: t.findSchemes, 
            Icon: Target, 
            desc: t.findSchemesDesc, 
            path: "/chat/schemes", 
            grad: "from-[#FF9933]/25 via-white/5 to-transparent",
            border: "hover:border-[#FF9933]/50"
          },
          { 
            title: t.accessServices, 
            Icon: ClipboardList, 
            desc: t.accessServicesDesc, 
            path: "/chat/services", 
            grad: "from-[#138808]/25 via-white/5 to-transparent",
            border: "hover:border-[#138808]/50"
          },
        ].map((m, i) => (
          <motion.button key={m.title}
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(m.path)}
            className={`relative glass-strong border border-white/10 rounded-3xl p-8 text-left ${m.border} transition-all duration-300 group overflow-hidden min-h-[260px] flex flex-col justify-between`}
          >
            {/* Hover interior glow */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: "inset 0 0 80px rgba(247,148,29,0.1)" }} />

            <div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                <m.Icon className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-white tracking-tight">{m.title}</h2>
              <p className="text-base text-white/50 leading-relaxed font-medium">{m.desc}</p>
            </div>
            
            {/* Arrow indicator */}
            <div className="self-end mt-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 transition-colors duration-300">
               <ChevronLeft className="w-5 h-5 rotate-180 text-white group-hover:text-slate-900" />
            </div>
          </motion.button>
        ))}
      </div>
    </main>
  );
}
