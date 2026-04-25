"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type SR = any;

export function useVoice(lang: string = "en-IN") {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SR | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const W: any = window;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = lang;
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setTranscript(t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
    return () => { try { r.stop(); } catch {} };
  }, [lang]);

  const startListening = useCallback(() => {
    setTranscript("");
    try { recRef.current?.start(); setListening(true); } catch {}
  }, []);

  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  const speak = useCallback((text: string, opts?: { rate?: number; lang?: string }) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts?.lang || lang;
    const slow = typeof window !== "undefined" && localStorage.getItem("slowSpeech") === "1";
    u.rate = opts?.rate ?? (slow ? 0.75 : 1);
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.speak(u);
  }, [lang]);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { startListening, stopListening, speak, stopSpeaking, listening, speaking, transcript, supported };
}
