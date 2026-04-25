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
      className="glass rounded-2xl p-5 space-y-4 hover:border-primary/30 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{scheme.name}</h3>
          <p className="text-sm text-primary mt-1.5 line-clamp-2">{scheme.benefit}</p>
        </div>

        {scheme.deadline && (
          <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium ${
            closingSoon
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : "bg-white/8 text-white/60 border border-white/10"
          }`}>
            <Calendar className="w-3 h-3" />
            {closingSoon ? "Closing soon!" : scheme.deadline}
          </span>
        )}
      </div>

      {/* Match bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Match score</span>
          <span className="font-semibold" style={{ color }}>{score}% · {label}</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}aa, ${color})` }}
          />
        </div>
      </div>

      {/* Eligibility */}
      {scheme.eligibility && (
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
          {scheme.eligibility}
        </p>
      )}

      {/* Documents */}
      {scheme.documents && scheme.documents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {scheme.documents.slice(0, 3).map((d) => (
            <span key={d} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-foreground/60">
              <FileText className="w-2.5 h-2.5" />
              {d}
            </span>
          ))}
          {scheme.documents.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground">
              +{scheme.documents.length - 3} more
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
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium group-hover:underline transition-colors"
        >
          View official portal <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </motion.div>
  );
}
