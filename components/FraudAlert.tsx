"use client";
import { AlertTriangle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function FraudAlert({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-red-600/20 border border-red-500 text-red-100 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">
        <strong className="block mb-1">⚠️ Middleman Fraud Alert</strong>
        Government schemes and services are FREE. Never pay agents, brokers, or anyone asking for fees. Apply only on official portals.
      </div>
      {onDismiss && <button onClick={onDismiss} className="text-red-300 hover:text-white"><X className="w-4 h-4" /></button>}
    </motion.div>
  );
}
