"use client";
import { ExternalLink, Calendar, CheckCircle2, FileText } from "lucide-react";
import { motion } from "framer-motion";

export type Scheme = {
  id?: string;
  name: string;
  benefit: string;
  eligibility?: string;
  documents?: string[];
  officialUrl?: string;
  deadline?: string | null;
  category?: string[];
};

export default function SchemeCard({ scheme, score = 80 }: { scheme: Scheme; score?: number }) {
  const color =
    score >= 75 ? "#22C55E" :
    score >= 50 ? "#F7941D" : "#EF4444";
  const label =
    score >= 75 ? "High match" :
    score >= 50 ? "Moderate" : "Low match";

  const closingSoon =
    scheme.deadline
      ? (new Date(scheme.deadline).getTime() - Date.now()) / 86400000 < 7
      : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-[2.5rem] p-8 space-y-6 border border-white/10 shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-500"
    >
      {/* Tricolour Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white leading-tight group-hover:text-primary transition-colors tracking-tight">{scheme.name}</h3>
          <div className="inline-block px-3 py-1 bg-secondary/20 border border-secondary/30 rounded-full mt-3">
             <p className="text-[10px] font-black text-secondary tracking-[0.15em] uppercase leading-none">{scheme.benefit}</p>
          </div>
        </div>

        {scheme.deadline && (
          <span className={`shrink-0 text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-black uppercase tracking-widest ${
            closingSoon
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-white/5 text-white/40 border border-white/10"
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            {closingSoon ? "Urgent: Closing" : scheme.deadline}
          </span>
        )}
      </div>

      {/* Match bar */}
      <div className="bg-white/5 p-4 rounded-3xl border border-white/5 shadow-inner backdrop-blur-md">
        <div className="flex justify-between text-[10px] mb-3 font-black uppercase tracking-[0.2em]">
          <span className="text-white/30">Eligibility Match</span>
          <span style={{ color: color === "#22C55E" ? "#4ADE80" : color }} className="font-bold text-xs">{score}% · {label}</span>
        </div>
        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1.5px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            style={{ background: `linear-gradient(90deg, ${color}22, ${color})` }}
          />
        </div>
      </div>

      {/* Eligibility */}
      {scheme.eligibility && (
        <p className="text-xs text-white/50 flex items-start gap-3 font-semibold leading-relaxed">
          <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
          {scheme.eligibility}
        </p>
      )}

      {/* Documents */}
      {scheme.documents && scheme.documents.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          {scheme.documents.slice(0, 3).map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 text-[9px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 font-black uppercase tracking-widest shadow-sm">
              <FileText className="w-3 h-3 text-white/30" />
              {d}
            </span>
          ))}
          {scheme.documents.length > 3 && (
            <span className="text-[9px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/30 font-black uppercase tracking-widest">
              +{scheme.documents.length - 3} More
            </span>
          )}
        </div>
      )}

      {/* Link */}
      {scheme.officialUrl && (
        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/link mt-4"
        >
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Open Official Portal</span>
          <ExternalLink className="w-4 h-4 text-primary group-hover/link:translate-x-1 transition-transform" />
        </a>
      )}
    </motion.div>
  );
}
