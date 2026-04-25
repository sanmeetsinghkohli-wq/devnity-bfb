"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import MicButton from "@/components/MicButton";
import { motion } from "framer-motion";

const QS = [
  { key: "name", q: "What is your name?" },
  { key: "age", q: "How old are you?" },
  { key: "income", q: "What is your monthly family income in rupees?" },
  { key: "category", q: "What is your category? General, OBC, SC, or ST?" },
];

export default function Profile() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const v = useVoice("en-IN");

  useEffect(() => {
    if (step < QS.length) v.speak(QS[step].q);
  }, [step]);

  useEffect(() => { setText(v.transcript); }, [v.transcript]);

  const next = (val: string) => {
    const k = QS[step].key;
    const updated = { ...profile, [k]: val };
    setProfile(updated);
    setText("");
    if (step + 1 >= QS.length) {
      localStorage.setItem("profile", JSON.stringify(updated));
      router.push("/state");
    } else setStep(step + 1);
  };

  const skip = () => next("");

  if (step >= QS.length) return null;
  const progress = ((step + 1) / QS.length) * 100;

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-xl mx-auto">
      <div className="h-1 bg-border rounded-full overflow-hidden mb-8">
        <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs text-muted-foreground mb-4">Question {step + 1} of {QS.length}</div>

      <motion.h2 key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-medium mb-8">{QS[step].q}</motion.h2>

      <div className="flex items-center gap-3 mb-4">
        <MicButton active={v.listening} onStart={v.startListening} onStop={v.stopListening} />
        <input value={text} onChange={e => setText(e.target.value)}
          placeholder="Or type your answer"
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" />
      </div>

      <div className="flex gap-2 mt-2">
        <button onClick={() => text.trim() && next(text.trim())}
          disabled={!text.trim()}
          className="flex-1 bg-primary text-black rounded-xl py-3 font-medium disabled:opacity-50">
          Next
        </button>
        <button onClick={skip} className="px-5 rounded-xl border border-border text-muted-foreground hover:text-foreground">Skip</button>
      </div>
    </main>
  );
}
