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
      className="bg-white rounded-[2rem] p-6 space-y-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">{scheme.name}</h3>
          <p className="text-xs font-bold text-secondary mt-2 tracking-wide uppercase">{scheme.benefit}</p>
        </div>

        {scheme.deadline && (
          <span className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 font-black uppercase tracking-wider ${
            closingSoon
              ? "bg-red-50 text-red-600 border border-red-100"
              : "bg-slate-50 text-slate-500 border border-slate-100"
          }`}>
            <Calendar className="w-3 h-3" />
            {closingSoon ? "Closing soon!" : scheme.deadline}
          </span>
        )}
      </div>

      {/* Match bar */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
          <span className="text-slate-400">Match score</span>
          <span style={{ color }}>{score}% · {label}</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100 p-[1px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}44, ${color})` }}
          />
        </div>
      </div>

      {/* Eligibility */}
      {scheme.eligibility && (
        <p className="text-xs text-slate-600 flex items-start gap-2 font-medium leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          {scheme.eligibility}
        </p>
      )}

      {/* Documents */}
      {scheme.documents && scheme.documents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {scheme.documents.slice(0, 3).map((d) => (
            <span key={d} className="inline-flex items-center gap-1 text-[9px] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold uppercase tracking-tight">
              <FileText className="w-3 h-3 text-slate-400" />
              {d}
            </span>
          ))}
          {scheme.documents.length > 3 && (
            <span className="text-[9px] px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-400 font-bold">
              +{scheme.documents.length - 3} MORE
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
          className="inline-flex items-center gap-1.5 text-xs text-[#000080] hover:text-primary font-black uppercase tracking-widest transition-all group-hover:gap-2"
        >
          Portal Link <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </motion.div>
  );
}
