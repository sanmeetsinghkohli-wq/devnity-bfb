"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVoice } from "@/hooks/useVoice";
import { useLang } from "@/hooks/useLang";
import MicButton from "@/components/MicButton";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

export default function Profile() {
  const router = useRouter();
  const { t, meta } = useLang();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const v = useVoice(meta.sttLang);

  const QS = [
    { key: "name", q: t.profileQ.name },
    { key: "age", q: t.profileQ.age },
    { key: "income", q: t.profileQ.income },
    { key: "category", q: t.profileQ.category },
  ];

  useEffect(() => {
    if (step < QS.length && t) {
      const id = setTimeout(() => v.speak(QS[step].q, { lang: meta.ttsLang }), 250);
      return () => clearTimeout(id);
    }
  }, [step, meta.ttsLang]);

  useEffect(() => { setText(v.transcript); }, [v.transcript]);

  const next = (val: string) => {
    const k = QS[step].key;
    const updated = { ...profile, [k]: val };
    setProfile(updated); setText("");
    if (step + 1 >= QS.length) {
      localStorage.setItem("profile", JSON.stringify(updated));
      router.push("/state");
    } else setStep(step + 1);
  };
  const skip = () => next("");

  if (step >= QS.length) return null;
  const progress = ((step + 1) / QS.length) * 100;

  return (
    <main className="min-h-screen flex flex-col p-6 max-w-xl mx-auto relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground mb-4 text-sm hover:text-foreground self-start">
        <ChevronLeft className="w-4 h-4" /> {t.back}
      </button>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
        <motion.div className="h-full bg-gradient-to-r from-primary to-secondary" animate={{ width: `${progress}%` }} />
      </div>
      <div className="text-xs text-muted-foreground mb-6">{step + 1} / {QS.length}</div>

      <motion.h2 key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-medium mb-10 leading-tight">{QS[step].q}</motion.h2>

      <div className="flex items-center gap-3 mb-4">
        <MicButton active={v.listening} onStart={v.startListening} onStop={v.stopListening} />
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && text.trim()) next(text.trim()); }}
          placeholder={t.orType}
          className="flex-1 bg-white/[0.03] backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" />
      </div>

      <div className="flex gap-2 mt-2">
        <button onClick={() => text.trim() && next(text.trim())} disabled={!text.trim()}
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-black rounded-xl py-3 font-medium disabled:opacity-40">
          {t.next}
        </button>
        <button onClick={skip} className="px-5 rounded-xl border border-white/10 text-muted-foreground hover:text-foreground">{t.skip}</button>
      </div>
    </main>
  );
}
