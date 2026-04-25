"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentChecklist({ docs, title = "Required Documents" }: { docs: string[]; title?: string }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <div className="glass-strong border border-white/10 rounded-[2rem] p-6 shadow-xl">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/40 leading-none">{title}</h4>
      <ul className="space-y-3">
        {docs.map((d, i) => (
          <li key={i} className="flex items-center gap-4 text-xs cursor-pointer group" onClick={() => setChecked(s => ({ ...s, [i]: !s[i] }))}>
            <motion.span 
              animate={{ scale: checked[i] ? 1.1 : 1 }} 
              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${checked[i] ? "bg-secondary border-secondary shadow-[0_0_15px_rgba(20,184,166,0.2)]" : "border-white/10 group-hover:border-white/20 bg-white/5"}`}
            >
              {checked[i] && <Check className="w-4 h-4 text-slate-900 font-bold" />}
            </motion.span>
            <span className={`font-semibold tracking-wide transition-all ${checked[i] ? "line-through text-white/20" : "text-white/70"}`}>
              {d}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
