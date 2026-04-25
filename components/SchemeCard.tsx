"use client";
import { ExternalLink, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export type Scheme = {
  id?: string;
  name: string;
  benefit: string;
  eligibility?: string;
  documents?: string[];
  officialUrl?: string;
  deadline?: string | null;
};

export default function SchemeCard({ scheme, score = 80 }: { scheme: Scheme; score?: number }) {
  const color = score >= 75 ? "#22C55E" : score >= 50 ? "#F7941D" : "#EF4444";
  const closingSoon = scheme.deadline ? (new Date(scheme.deadline).getTime() - Date.now()) / 86400000 < 7 : false;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{scheme.name}</h3>
          <p className="text-sm text-primary mt-1">{scheme.benefit}</p>
        </div>
        {scheme.deadline && (
          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${closingSoon ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/70"}`}>
            <Calendar className="w-3 h-3" /> {scheme.deadline}
          </span>
        )}
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Match score</span>
          <span style={{ color }}>{score}%</span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8 }}
            className="h-full rounded-full" style={{ background: color }} />
        </div>
      </div>

      {scheme.eligibility && <p className="text-xs text-muted-foreground">{scheme.eligibility}</p>}

      {scheme.officialUrl && (
        <a href={scheme.officialUrl} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          Official portal <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </motion.div>
  );
}
