"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Download, Share2, Layers, MapPin, Mic, MoreVertical, Home } from "lucide-react";
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

import { ElegantShape } from "./ui/shape-landing-hero";

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
      const id = setTimeout(() => { try { v.startListening(); } catch {} }, 800);
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
      }, 600); // Ultra-fast turnaround
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
      v.speak(reply, { lang: meta.ttsLang });
    } finally { setLoading(false); }
  }

  function findOfficesFn() { setFoundOffices((offices as any)[pincode] || []); }

  function downloadPdf() {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const profileInfo = JSON.parse(localStorage.getItem("profile") || "{}");
      
      // ── Header: Official Tricolour Bar ──
      doc.setFillColor(255, 153, 51); doc.rect(0, 0, pageWidth, 5, "F");
      doc.setFillColor(255, 255, 255); doc.rect(0, 5, pageWidth, 5, "F");
      doc.setFillColor(19, 136, 8); doc.rect(0, 10, pageWidth, 5, "F");

      doc.setTextColor(0, 0, 128); doc.setFont("helvetica", "bold"); doc.setFontSize(24);
      doc.text("SARKARSATHI", 14, 30);
      doc.setFontSize(10); doc.setTextColor(100); doc.setFont("helvetica", "normal");
      doc.text("Digital Scheme Assistant — Conversation Summary", 14, 36);
      doc.setDrawColor(0, 0, 128); doc.setLineWidth(0.5); doc.line(14, 42, pageWidth - 14, 42);

      // Citizen Data Recap
      doc.setFillColor(248, 250, 252); doc.rect(14, 48, pageWidth - 28, 25, "F");
      doc.setDrawColor(226, 232, 240); doc.rect(14, 48, pageWidth - 28, 25, "S");
      doc.setTextColor(0, 0, 128); doc.setFontSize(11); doc.setFont("helvetica", "bold");
      
      const citizenLabel = meta.id === "hi" ? "नागरिक (CITIZEN)" : meta.id === "mr" ? "नागरिक (CITIZEN)" : "CITIZEN";
      const nameToPrint = profileInfo.name || "Valued Citizen";
      
      doc.text(`${citizenLabel}: ${nameToPrint.toUpperCase()}`, 20, 58);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(80);
      doc.text(`STATE: ${state || "India"} | CATEGORY: ${profileInfo.category || "General"} | DATE: ${new Date().toLocaleDateString()}`, 20, 65);

      let y = 85;
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 128);
      
      // ── SMART ELIGIBILITY FILTERING ──
      const filterSchemes = () => {
        const p = profileInfo || {};
        const age = parseInt(p.age || "0");
        const gender = (p.gender || "").toLowerCase();
        const income = parseInt((p.income || "0").replace(/[^0-9]/g, ""));
        const category = (p.category || "General").toUpperCase();

        return (schemes || []).filter(s => {
          const tags = (s.category || []).map(t => t.toLowerCase());
          
          // Gender Filter
          if (tags.includes("women") && !gender.includes("fem") && !gender.includes("स्त्री") && !gender.includes("महि")) return false;
          
          // Socio-Economic Filter (BPL)
          if (tags.includes("bpl") && income > 10000) return false;
          
          // Age Filters (Basic)
          if (tags.includes("elderly") && age < 60) return false;
          if (tags.includes("children") && age > 18) return false;

          // Category Check (If scheme specific to non-general)
          if (tags.includes("sc/st") && category === "GENERAL") return false;

          return true;
        }).slice(0, 10);
      };

      const schemesToPrint = filterSchemes();
      const reportTitle = meta.id === "hi" ? "अनुशंसित योजनाएं (RECOMMENDED SCHEMES)" : meta.id === "mr" ? "शिफारस केलेल्या योजना (RECOMMENDED SCHEMES)" : "RECOMMENDED SCHEMES";
      doc.text(reportTitle, 14, y); y += 10;
      
      schemesToPrint.forEach((s, i) => {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFillColor(255, 255, 255); doc.setDrawColor(230, 230, 230); doc.rect(14, y, pageWidth - 28, 28, "S");
        doc.setFillColor(0, 0, 128); doc.rect(14, y, 2, 28, "F");

        doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text(`${i + 1}. ${s.name}`, 20, y + 8);
        doc.setTextColor(19, 136, 8); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        
        const benefitLabel = meta.id === "hi" ? "लाभ (BENEFIT)" : meta.id === "mr" ? "फायदा (BENEFIT)" : "BENEFIT";
        const docLabel = meta.id === "hi" ? "दस्तावेज़ (DOCS)" : meta.id === "mr" ? "कागदपत्रे (DOCS)" : "DOCUMENTS";

        doc.text(`${benefitLabel}: ${s.benefit}`, 20, y + 15, { maxWidth: pageWidth - 40 });
        doc.setTextColor(100, 100, 100); doc.setFontSize(8);
        doc.text(`${docLabel}: ${(s.documents || []).join(", ")}`, 20, y + 22, { maxWidth: pageWidth - 40 });
        y += 34;
      });

      doc.text("This document is computer-generated for informational purposes. Verify all details on official portals.", pageWidth/2, 285, { align: "center" });
      doc.save(`SarkarSathi_Report_${meta.id}.pdf`);
      setMenuOpen(false);
    });
  }

  function shareWA() {
    const txt = encodeURIComponent(`SarkarSathi — government schemes assistant. Try it!`);
    window.open(`https://wa.me/?text=${txt}`, "_blank");
    setMenuOpen(false);
  }

  return (
    <main className="min-h-screen flex flex-col max-w-4xl mx-auto relative bg-[#F1F5F9] overflow-hidden shadow-2xl border-x border-slate-200">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/[0.05] via-transparent to-[#138808]/[0.05] blur-3xl" />
        <ElegantShape
          delay={0.3}
          width={500}
          height={120}
          rotate={12}
          gradient="from-[#FF9933]/[0.08]"
          className="left-[-15%] top-[15%]"
        />
        <ElegantShape
          delay={0.5}
          width={400}
          height={100}
          rotate={-15}
          gradient="from-[#138808]/[0.08]"
          className="right-[-10%] top-[40%]"
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 sticky top-0 glass-strong z-20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/mode")} 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <button 
            onClick={() => router.push("/")} 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-sm"
            title={t.home}
          >
            <Home className="w-4 h-4 text-white/70" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-white/20 flex items-center justify-center p-1 shadow-inner shrink-0 leading-none">
              <img src="/logo.png" alt="Logo" className="w-[85%] h-auto" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none mb-1 text-white tracking-tight">
                {mode === "schemes" ? "Schemes Assistant" : "Services Assistant"}
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">📍 {state || "India"}</span>
                {v.speaking && <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-0.5 rounded-full"><SpeakingIndicator /> Speaking</span>}
                {v.listening && <span className="flex items-center gap-1.5 text-secondary bg-secondary/10 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"/> Listening</span>}
                {!v.speaking && !v.listening && <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> System Active</span>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative">
          {(schemes || services) && (
            <button 
              onClick={() => setShowPanel(p => !p)} 
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors shadow-sm ${showPanel ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
            >
              <Layers className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <button 
              onClick={downloadPdf}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary hover:bg-white/10 transition-colors shadow-sm"
              title={t.pdf}
            >
              <Download className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 transition-colors shadow-sm"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-12 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 text-sm font-semibold"
                >
                  <button onClick={shareWA} className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/5 text-white/80 transition-colors">
                    <Share2 className="w-4 h-4 text-secondary" /> {t.share || "Share PDF"}
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
            <span className="text-[10px] text-slate-500 bg-white/50 px-3 py-1 rounded-full uppercase tracking-widest font-black border border-white/20">
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
                 <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-r from-primary via-white to-secondary flex items-center justify-center text-sm shadow-md border border-black/5 mb-1">🏛️</div>
                 <div className="glass text-white rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm inline-flex items-center gap-3 w-fit">
                    <div className="flex space-x-1.5">
                      <div className="dot w-1.5 h-1.5 bg-primary" />
                      <div className="dot w-1.5 h-1.5 bg-white/20" />
                      <div className="dot w-1.5 h-1.5 bg-secondary" />
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
              className="absolute inset-0 md:relative md:inset-auto glass-strong border-l border-white/10 z-30 overflow-y-auto px-4 py-6"
            >
              <div className="flex items-center justify-between mb-6 block md:hidden">
                <h3 className="font-bold text-lg text-white tracking-tight">Matches</h3>
                <button onClick={() => setShowPanel(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><ChevronLeft className="w-4 h-4 text-white/50" /></button>
              </div>

              {schemes && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 hidden md:block mb-6 px-1">Top Matches</h3>
                  {(() => {
                    const p = JSON.parse(localStorage.getItem("profile") || "{}");
                    const age = parseInt(p.age || "0");
                    const gender = (p.gender || "").toLowerCase();
                    const income = parseInt((p.income || "0").replace(/[^0-9]/g, ""));
                    const category = (p.category || "General").toUpperCase();

                    return (schemes || []).filter(s => {
                      const tags = (s.category || []).map(t => t.toLowerCase());
                      if (tags.includes("women") && !gender.includes("fem") && !gender.includes("स्त्री") && !gender.includes("महि")) return false;
                      if (tags.includes("bpl") && income > 10000) return false;
                      if (tags.includes("elderly") && age < 60) return false;
                      if (tags.includes("children") && age > 18) return false;
                      if (tags.includes("sc/st") && category === "GENERAL") return false;
                      return true;
                    }).slice(0, 6);
                  })().map((s, i) => (
                    <SchemeCard key={i} scheme={s} score={90 - (i % 3) * 15} />
                  ))}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/report")} 
                    className="w-full bg-gradient-to-r from-primary via-white to-secondary text-slate-800 py-4 rounded-2xl font-black shadow-xl shadow-primary/10 border border-black/5 uppercase tracking-widest text-xs"
                  >
                    View Full Report
                  </motion.button>
                </div>
              )}

              {services && (
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 hidden md:block mb-4 px-1">Service Guides</h3>
                  {services.map((s) => (
                    <div key={s.id} className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-5 text-xl">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">{s.icon}</span> 
                        <strong className="text-white tracking-tight text-lg">{s.name}</strong>
                      </div>
                      <ol className="text-sm space-y-3 list-decimal list-outside ml-5 text-white/60 mb-6 marker:text-primary marker:font-black">
                        {s.steps.map((st: string, i: number) => <li key={i} className="pl-2 leading-relaxed">{st}</li>)}
                      </ol>
                      <div className="mb-6"><DocumentChecklist docs={s.documents} /></div>
                      
                      <div className="bg-black/20 rounded-2xl p-4 flex items-center gap-4 border border-white/5 mb-6">
                        <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-sm">
                          <QRCodeSVG value={s.portal} size={54} />
                        </div>
                        <a href={s.portal} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all font-bold">
                          {s.portal}
                        </a>
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-[#FF9933]/20 via-white/5 to-[#138808]/20 border border-white/10 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                      >
                         📝 Direct Apply (Beta)
                      </motion.button>
                    </div>
                  ))}

                  <div className="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-inner">
                    <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-white/40">
                      <MapPin className="w-4 h-4 text-primary" /> {t.offices}
                    </h4>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input value={pincode} onChange={e => setPincode(e.target.value)} placeholder={t.pincodePh}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none font-medium text-white shadow-sm" />
                        <button 
                          onClick={async () => {
                            if (!navigator.geolocation) return;
                            navigator.geolocation.getCurrentPosition(async (pos) => {
                              try {
                                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
                                const data = await res.json();
                                if (data.postcode) {
                                  setPincode(data.postcode);
                                  setFoundOffices((offices as any)[data.postcode] || []);
                                }
                              } catch {}
                            });
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 text-primary transition-colors"
                          title="Use current location"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={findOfficesFn} className="px-5 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition-colors uppercase tracking-tight">{t.findOffices}</button>
                    </div>
                    <ul className="mt-5 space-y-3">
                      {foundOffices.map((o, i) => (
                        <li key={i} className="text-sm text-white/70 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm">
                          <strong className="text-white block mb-1 font-bold">{o.name}</strong> 
                          <span className="text-xs text-white/50 leading-relaxed block">{o.address}</span> 
                          <span className="mt-3 inline-block text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 tracking-wider uppercase">{o.distance}</span>
                        </li>
                      ))}
                      {pincode && foundOffices.length === 0 && <li className="text-[11px] text-white/30 text-center py-4 font-bold uppercase tracking-widest">{t.noOffices}</li>}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="glass-strong p-5 border-t border-white/10 z-20">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <MicButton active={v.listening} onStart={v.startListening} onStop={v.stopListening} />
          
          <div className="flex-1 relative flex items-center">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(input); }}
              placeholder={t.typeOrSpeak || "Type a message..."}
              className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] pl-6 pr-16 py-4.5 text-base focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-white/20 font-medium text-white shadow-inner" 
            />
            
            <button 
              onClick={() => send(input)} 
              disabled={!input.trim() || loading}
              className="absolute right-2.5 w-11 h-11 bg-white hover:bg-slate-100 text-slate-900 rounded-[1.1rem] flex items-center justify-center disabled:opacity-10 transition-all shadow-lg active:scale-95"
            >
              <Send className="w-5 h-5 ml-0.5" />
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
