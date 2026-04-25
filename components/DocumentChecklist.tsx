"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentChecklist({ docs, title = "Required Documents" }: { docs: string[]; title?: string }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h4 className="font-medium mb-3 text-sm">{title}</h4>
      <ul className="space-y-2">
        {docs.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm cursor-pointer" onClick={() => setChecked(s => ({ ...s, [i]: !s[i] }))}>
            <motion.span animate={{ scale: checked[i] ? 1 : 0.9 }} className={`w-5 h-5 rounded border flex items-center justify-center ${checked[i] ? "bg-success border-success" : "border-border"}`}>
              {checked[i] && <Check className="w-3 h-3 text-black" />}
            </motion.span>
            <span className={checked[i] ? "line-through text-muted-foreground" : ""}>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
