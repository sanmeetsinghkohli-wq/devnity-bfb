"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type SR = any;

export function useVoice(lang: string = "en-IN") {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SR | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const langRef = useRef(lang);

  useEffect(() => { langRef.current = lang; }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const W: any = window;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = lang;
    r.onresult = (e: any) => setTranscript(Array.from(e.results).map((rr: any) => rr[0].transcript).join(""));
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

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, opts?: { lang?: string; rate?: string }) => {
    if (typeof window === "undefined" || !text) return;
    stopSpeaking();
    const useLang = opts?.lang || langRef.current;
    const slow = localStorage.getItem("slowSpeech") === "1";
    const rate = opts?.rate ?? (slow ? "-25%" : "0%");

    // Try Azure TTS via /api/tts
    try {
      const res = await fetch("/api/tts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: useLang, rate }),
      });
      if (res.ok && res.headers.get("Content-Type")?.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onplay = () => setSpeaking(true);
        audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
        audio.onerror = (e) => { console.error("Audio playback error", e); setSpeaking(false); };
        
        try {
            await audio.play();
        } catch (playErr) {
            console.error("Audio autoplay was blocked or failed", playErr);
            setSpeaking(false);
        }
        return;
      } else {
        const errText = await res.text();
        console.warn("Azure TTS API failed:", res.status, errText);
      }
    } catch (apiErr) {
        console.error("Failed to fetch from /api/tts", apiErr);
    }

    console.log("Falling back to native browser Web Speech API");
    // Fallback: browser TTS
    const synth = window.speechSynthesis;
    if (!synth) {
       console.error("Browser does not support SpeechSynthesis");
       return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = useLang;
    const voices = synth.getVoices();
    const match = voices.find(v => v.lang === u.lang) || voices.find(v => v.lang.startsWith(u.lang.split("-")[0]));
    if (match) u.voice = match;
    u.rate = slow ? 0.75 : 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = (e) => { console.error("Browser TTS error", e); setSpeaking(false); };
    synth.speak(u);
  }, [stopSpeaking]);

  return { startListening, stopListening, speak, stopSpeaking, listening, speaking, transcript, supported };
}
