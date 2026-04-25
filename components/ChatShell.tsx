"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Download, Share2, Layers, MapPin, Mic, MoreVertical } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

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
  const [menuOpen, setMenuOpen] = useState(false);
  
  const v = useVoice(meta.sttLang);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);
  const wasListening = useRef(false);
  const wasSpeaking = useRef(false);
  const lastTranscript = useRef("");
  const advancingRef = useRef(false);

  useEffect(() => {
    setState(localStorage.getItem("state") || "");
    const greeting = mode === "schemes" ? t.greetingSchemes : t.greetingServices;
    setMessages([{ role: "assistant", content: greeting, time: now() }]);
    if (!greeted.current) {
      greeted.current = true;
      setTimeout(() => v.speak(greeting, { lang: meta.ttsLang }), 400);
    }
  }, [mode, t, meta.ttsLang]);

  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync state cleanly
  useEffect(() => { setInput(v.transcript); }, [v.transcript]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }); }, [messages, loading]);

  // Hands-free: auto-start mic gracefully after AI finishes speaking
  useEffect(() => {
    const stoppedSpeaking = wasSpeaking.current && !v.speaking;
    wasSpeaking.current = v.speaking;
    
    // Once AI stops talking, if we aren't loading, start mic automatically!
    if (stoppedSpeaking && !loading && !v.listening) {
      const id = setTimeout(() => { try { v.startListening(); } catch {} }, 450);
      return () => clearTimeout(id);
    }
  }, [v.speaking, loading, v.listening]);

  // Barge-in & Auto-Send Silence Detection
  useEffect(() => {
    // If the user starts talking while AI is talking, gracefully interrupt the AI
    if (v.transcript.trim() && v.speaking) {
      v.stopSpeaking();
    }

    // Reset silence timer every time the transcript updates
    if (silenceTimer.current) clearTimeout(silenceTimer.current);

    // If there is actual text, start a 1.8 second countdown to auto-send the message.
    if (v.transcript.trim() && !advancingRef.current && v.listening) {
      silenceTimer.current = setTimeout(() => {
        const textToCapture = v.transcript.trim();
        if (textToCapture) {
          advancingRef.current = true; 
          v.stopListening(); // Stop mic to prevent echoing during AI processing
          send(textToCapture).finally(() => { advancingRef.current = false; });
        }
      }, 1800); // 1.8 seconds of silence triggers send
    }
    
    return () => { if (silenceTimer.current) clearTimeout(silenceTimer.current); };
  }, [v.transcript, v.listening, v.speaking]);

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
      setMenuOpen(false);
    });
  }

  function shareWA() {
    const txt = encodeURIComponent(`SarkarSathi — government schemes assistant. Try it!`);
    window.open(`https://wa.me/?text=${txt}`, "_blank");
    setMenuOpen(false);
  }

  return (
    <main className="min-h-screen flex flex-col max-w-4xl mx-auto relative bg-[#050510] overflow-hidden shadow-2xl">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 sticky top-0 bg-[#050510]/80 backdrop-blur-2xl z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/mode")} 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-lg leading-none mb-1 text-white tracking-wide">
              {mode === "schemes" ? "Schemes Assistant" : "Services Assistant"}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">🏛️ {state || "India"}</span>
              {v.speaking && <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-0.5 rounded-full"><SpeakingIndicator /> Speaking</span>}
              {v.listening && <span className="flex items-center gap-1.5 text-success bg-success/10 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-success animate-ping"/> Listening</span>}
              {!v.speaking && !v.listening && <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative">
          {(schemes || services) && (
            <button 
              onClick={() => setShowPanel(p => !p)} 
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${showPanel ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
            >
              <Layers className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-white/10 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-12 w-48 glass-strong border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50 text-sm"
                >
                  <button onClick={downloadPdf} className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors">
                    <Download className="w-4 h-4 text-primary" /> {t.pdf || "Download PDF"}
                  </button>
                  <button onClick={shareWA} className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors">
                    <Share2 className="w-4 h-4 text-success" /> {t.share || "Share PDF"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div ref={scrollRef} className={`flex-1 overflow-y-auto px-4 py-6 space-y-6 ${showPanel ? 'hidden md:block' : 'block'}`}>
          
          {fraud && <div className="mb-4 fade-up"><FraudAlert title={t.fraudTitle} body={t.fraudBody} onDismiss={() => setFraud(false)} /></div>}

          {/* Intro date/divider */}
          <div className="flex justify-center mb-6">
            <span className="text-[10px] text-muted-foreground bg-white/5 px-3 py-1 rounded-full uppercase tracking-wider font-semibold border border-white/5">
              Today
            </span>
          </div>

          <div className="space-y-6">
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} text={m.content + (m.offline ? `\n\n${t.offlineMode}` : "")} time={m.time}
                speaking={v.speaking && m.role === "assistant" && i === messages.length - 1}
                readLabel={t.readAloud} stopLabel={t.stop}
                onReadAloud={m.role === "assistant" ? () => v.speaking ? v.stopSpeaking() : v.speak(m.content, { lang: meta.ttsLang }) : undefined} />
            ))}

            {loading && (
              <div className="flex items-end gap-2 w-full justify-start msg-assistant">
                 <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm shadow-lg mb-1">🏛️</div>
                 <div className="glass text-foreground rounded-2xl rounded-bl-sm border-white/10 px-5 py-4 shadow-md inline-flex items-center gap-3 w-fit">
                    <div className="flex space-x-1">
                      <div className="dot" />
                      <div className="dot" />
                      <div className="dot" />
                    </div>
                 </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && !loading && (
            <div className="pt-8"><QuickPrompts prompts={prompts} onPick={send} /></div>
          )}
        </div>

        {/* Side panel for schemes/services */}
        <AnimatePresence>
          {showPanel && (
            <motion.div 
              initial={{ opacity: 0, x: 200, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "100%", maxWidth: "400px" }}
              exit={{ opacity: 0, x: 200, width: 0 }}
              className="absolute inset-0 md:relative md:inset-auto bg-[#0A0A1A]/95 backdrop-blur-3xl md:border-l border-white/10 z-10 overflow-y-auto px-4 py-6"
            >
              <div className="flex items-center justify-between mb-6 block md:hidden">
                <h3 className="font-semibold text-lg text-white tracking-wide">Matches</h3>
                <button onClick={() => setShowPanel(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
              </div>

              {schemes && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground hidden md:block mb-4 px-1">Top Matches</h3>
                  {schemes.slice(0, 6).map((s, i) => (
                    <SchemeCard key={i} scheme={s} score={90 - (i % 3) * 15} />
                  ))}
                  <button onClick={() => router.push("/report")} className="w-full bg-gradient-to-br from-primary to-secondary text-black py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    View Full Report
                  </button>
                </div>
              )}

              {services && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground hidden md:block mb-4 px-1">Service Guides</h3>
                  {services.map((s) => (
                    <div key={s.id} className="glass rounded-2xl p-5 border-white/10 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3 mb-4 text-xl">
                        <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">{s.icon}</span> 
                        <strong className="text-white tracking-tight">{s.name}</strong>
                      </div>
                      <ol className="text-sm space-y-2 list-decimal list-outside ml-4 text-foreground/80 mb-5 marker:text-primary marker:font-semibold">
                        {s.steps.map((st: string, i: number) => <li key={i} className="pl-1 leading-relaxed">{st}</li>)}
                      </ol>
                      <div className="mb-4"><DocumentChecklist docs={s.documents} /></div>
                      
                      <div className="bg-black/30 rounded-xl p-3 flex items-center gap-4">
                        <div className="bg-white p-1 rounded-lg shrink-0">
                          <QRCodeSVG value={s.portal} size={50} />
                        </div>
                        <a href={s.portal} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline break-all font-medium">
                          {s.portal}
                        </a>
                      </div>
                    </div>
                  ))}

                  <div className="glass rounded-2xl p-5 border-white/10">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-white">
                      <MapPin className="w-4 h-4 text-primary" /> {t.offices}
                    </h4>
                    <div className="flex gap-2">
                      <input value={pincode} onChange={e => setPincode(e.target.value)} placeholder={t.pincodePh}
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 outline-none" />
                      <button onClick={findOfficesFn} className="px-5 bg-primary text-black rounded-xl text-sm font-bold shadow-md">{t.findOffices}</button>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {foundOffices.map((o, i) => (
                        <li key={i} className="text-sm text-foreground/80 bg-white/5 p-3 rounded-xl border border-white/5">
                          <strong className="text-white block mb-0.5">{o.name}</strong> 
                          <span className="text-xs text-muted-foreground">{o.address}</span> 
                          <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">{o.distance}</span>
                        </li>
                      ))}
                      {pincode && foundOffices.length === 0 && <li className="text-xs text-muted-foreground text-center py-2">{t.noOffices}</li>}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="bg-[#050510]/90 backdrop-blur-2xl p-4 border-t border-white/5 z-20">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <MicButton active={v.listening} onStart={v.startListening} onStop={v.stopListening} />
          
          <div className="flex-1 relative flex items-center">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(input); }}
              placeholder={t.typeOrSpeak || "Type a message or use the mic..."}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm focus:border-primary/50 focus:bg-white/10 outline-none transition-all placeholder:text-white/20 shadow-inner" 
            />
            
            <button 
              onClick={() => send(input)} 
              disabled={!input.trim() || loading}
              className="absolute right-2 w-10 h-10 bg-primary hover:bg-primary/90 text-black rounded-xl flex items-center justify-center disabled:opacity-30 disabled:hover:bg-primary transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
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
