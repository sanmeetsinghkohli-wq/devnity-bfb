"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Download, Share2, Layers, MapPin, Mic } from "lucide-react";
import ChatBubble from "./ChatBubble";
import MicButton from "./MicButton";
import QuickPrompts from "./QuickPrompts";
import FraudAlert from "./FraudAlert";
import SchemeCard, { Scheme } from "./SchemeCard";
import DocumentChecklist from "./DocumentChecklist";
import SpeakingIndicator from "./SpeakingIndicator";
import { useVoice } from "@/hooks/useVoice";
import { useLang } from "@/hooks/useLang";
import { QRCodeSVG } from "qrcode.react";
import offlineFaqs from "@/data/offline_faqs.json";
import offices from "@/data/offices.json";

type Msg = { role: "user" | "assistant"; content: string; time: string; offline?: boolean };

export default function ChatShell({
  mode, buildSystemPrompt, prompts, schemes, services,
}: {
  mode: "schemes" | "services";
  buildSystemPrompt: (langName: string) => string;
  prompts: string[];
  schemes?: Scheme[];
  services?: any[];
}) {
  const router = useRouter();
  const { t, meta } = useLang();
  const [state, setState] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fraud, setFraud] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [pincode, setPincode] = useState("");
  const [foundOffices, setFoundOffices] = useState<any[]>([]);
  const v = useVoice(meta.sttLang);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);

  useEffect(() => {
    setState(localStorage.getItem("state") || "");
    const greeting = mode === "schemes" ? t.greetingSchemes : t.greetingServices;
    setMessages([{ role: "assistant", content: greeting, time: now() }]);
    if (!greeted.current) {
      greeted.current = true;
      setTimeout(() => v.speak(greeting, { lang: meta.ttsLang }), 400);
    }
  }, [mode, t, meta.ttsLang]);

  useEffect(() => { setInput(v.transcript); }, [v.transcript]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }); }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim(); if (!trimmed) return;
    const userMsg: Msg = { role: "user", content: trimmed, time: now() };
    setMessages(m => [...m, userMsg]);
    setInput(""); setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
          systemPrompt: buildSystemPrompt(meta.aiLangName),
        }),
      });
      const data = await res.json();
      if (data.fraudAlert) setFraud(true);
      const reply = data.reply as string;
      setMessages(m => [...m, { role: "assistant", content: reply, time: now() }]);
      v.speak(reply, { lang: meta.ttsLang });
    } catch {
      const offlineAns = findOfflineAnswer(trimmed, state);
      const reply = offlineAns ?? "I'm offline. Try a basic question.";
      setMessages(m => [...m, { role: "assistant", content: reply, time: now(), offline: true }]);
      v.speak(reply, { lang: meta.ttsLang });
    } finally { setLoading(false); }
  }

  function findOfficesFn() { setFoundOffices((offices as any)[pincode] || []); }

  function downloadPdf() {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(18); doc.text("SarkarSathi — Eligibility Report", 14, 18);
      doc.setFontSize(11);
      const profile = JSON.parse(localStorage.getItem("profile") || "{}");
      doc.text(`State: ${state}`, 14, 30);
      doc.text(`Name: ${profile.name || "—"}`, 14, 38);
      doc.text(`Age: ${profile.age || "—"}  Income: ${profile.income || "—"}  Category: ${profile.category || "—"}`, 14, 46);
      let y = 60;
      (schemes || []).forEach((s, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(13); doc.text(`${i + 1}. ${s.name}`, 14, y); y += 7;
        doc.setFontSize(10); doc.text(`Benefit: ${s.benefit}`, 14, y); y += 6;
        doc.text(`Docs: ${(s.documents || []).join(", ")}`, 14, y, { maxWidth: 180 }); y += 12;
      });
      doc.save("sarkarsathi-report.pdf");
    });
  }

  function shareWA() {
    const txt = encodeURIComponent(`SarkarSathi — government schemes assistant. Try it!`);
    window.open(`https://wa.me/?text=${txt}`, "_blank");
  }

  return (
    <main className="min-h-screen flex flex-col max-w-2xl mx-auto p-4 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <header className="flex items-center justify-between mb-3 sticky top-0 bg-background/70 backdrop-blur-xl z-20 -mx-4 px-4 py-3 border-b border-white/5">
        <button onClick={() => router.push("/mode")} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
          <ChevronLeft className="w-4 h-4" /> {t.back}
        </button>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>🏛️ {state}</span>
          {v.speaking && <span className="flex items-center gap-1 text-primary"><SpeakingIndicator /></span>}
        </div>
        {(schemes || services) && (
          <button onClick={() => setShowPanel(p => !p)} className="text-muted-foreground hover:text-primary">
            <Layers className="w-4 h-4" />
          </button>
        )}
      </header>

      {fraud && <div className="mb-3"><FraudAlert title={t.fraudTitle} body={t.fraudBody} onDismiss={() => setFraud(false)} /></div>}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.content + (m.offline ? `\n\n${t.offlineMode}` : "")} time={m.time}
            speaking={v.speaking}
            readLabel={t.readAloud} stopLabel={t.stop}
            onReadAloud={m.role === "assistant" ? () => v.speaking ? v.stopSpeaking() : v.speak(m.content, { lang: meta.ttsLang }) : undefined} />
        ))}

        {loading && <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-xl p-3 inline-flex items-center gap-2 text-sm text-muted-foreground"><SpeakingIndicator /> {t.thinking}</div>}

        {messages.length <= 1 && (
          <div className="pt-2"><QuickPrompts prompts={prompts} onPick={send} /></div>
        )}

        {showPanel && schemes && (
          <div className="space-y-3 pt-2">
            {schemes.slice(0, 6).map((s, i) => <SchemeCard key={i} scheme={s} score={70 + (i % 3) * 10} />)}
            <button onClick={() => router.push("/report")} className="w-full bg-gradient-to-r from-primary to-secondary text-black py-3 rounded-xl font-medium">{t.viewReport}</button>
          </div>
        )}

        {showPanel && services && (
          <div className="space-y-3 pt-2">
            {services.map((s) => (
              <div key={s.id} className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 text-lg">{s.icon} <strong>{s.name}</strong></div>
                <ol className="text-sm space-y-1 list-decimal list-inside text-foreground/80">
                  {s.steps.map((st: string, i: number) => <li key={i}>{st}</li>)}
                </ol>
                <div className="mt-3"><DocumentChecklist docs={s.documents} /></div>
                <div className="mt-3 flex items-center gap-3">
                  <QRCodeSVG value={s.portal} size={72} bgColor="#0E0E1C" fgColor="#F7941D" />
                  <a href={s.portal} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">{s.portal}</a>
                </div>
              </div>
            ))}

            <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-xl p-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><MapPin className="w-4 h-4" /> {t.offices}</h4>
              <div className="flex gap-2">
                <input value={pincode} onChange={e => setPincode(e.target.value)} placeholder={t.pincodePh}
                  className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <button onClick={findOfficesFn} className="px-4 bg-primary text-black rounded-lg text-sm font-medium">{t.findOffices}</button>
              </div>
              <ul className="mt-3 space-y-2">
                {foundOffices.map((o, i) => (
                  <li key={i} className="text-xs text-foreground/80"><strong>{o.name}</strong> — {o.address} <span className="text-muted-foreground">({o.distance})</span></li>
                ))}
                {pincode && foundOffices.length === 0 && <li className="text-xs text-muted-foreground">{t.noOffices}</li>}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl pt-3 -mx-4 px-4 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={downloadPdf} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary">
            <Download className="w-3 h-3" /> {t.pdf}
          </button>
          <button onClick={shareWA} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary">
            <Share2 className="w-3 h-3" /> {t.share}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <MicButton active={v.listening} onStart={v.startListening} onStop={v.stopListening} />
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(input); }}
            placeholder={t.typeOrSpeak}
            className="flex-1 bg-white/[0.03] backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" />
          <button onClick={() => send(input)} disabled={!input.trim()}
            className="w-12 h-12 bg-gradient-to-br from-primary to-secondary text-black rounded-xl flex items-center justify-center disabled:opacity-40">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}

function now() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function findOfflineAnswer(q: string, state: string): string | null {
  const list = (offlineFaqs as any)[state] || [];
  const lower = q.toLowerCase();
  const hit = list.find((f: any) => lower.includes(f.q));
  return hit ? hit.a : null;
}
