"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export function useVoice(lang: string = "en-IN") {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const fallbackRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const langRef = useRef(lang);

  useEffect(() => { langRef.current = lang; }, [lang]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, []);

  const startListening = useCallback(async () => {
    setTranscript("");
    setListening(true);

    try {
      // 1. Try Azure STT for maximum speed & accuracy
      const res = await fetch("/api/speech-token");
      const { token, region } = await res.json();

      if (token && region) {
        const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
        speechConfig.speechRecognitionLanguage = langRef.current;
        
        // Optimize for speed
        speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceResponse_PostProcessingOption, "TrueText");
        
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizing = (s, e) => {
          setTranscript(e.result.text);
        };

        recognizer.recognized = (s, e) => {
          if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            setTranscript(e.result.text);
          }
        };

        recognizer.canceled = () => stopListening();
        recognizer.sessionStopped = () => stopListening();

        recognizer.startContinuousRecognitionAsync();
        recognizerRef.current = recognizer;
        return;
      }
    } catch (err) {
      console.warn("Azure STT Error, falling back to browser API:", err);
    }

    // 2. Fallback to Browser Native STT
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.lang = langRef.current;
      r.onresult = (e: any) => {
        const result = Array.from(e.results).map((rr: any) => rr[0].transcript).join("");
        setTranscript(result);
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      r.start();
      fallbackRef.current = r;
    } else {
      setSupported(false);
      setListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync();
      recognizerRef.current = null;
    }
    if (fallbackRef.current) {
      try { fallbackRef.current.stop(); } catch {}
      fallbackRef.current = null;
    }
    setListening(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      const a = audioRef.current;
      // Detach listeners BEFORE clearing src so onerror/onended don't trigger fallback or double-play
      a.onplay = null; a.onended = null; a.onerror = null;
      a.pause();
      try { a.removeAttribute("src"); a.load(); } catch {}
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const browserTTS = useCallback((text: string, useLang: string, slow: boolean) => {
    const synth = window.speechSynthesis;
    if (!synth) { console.warn("[TTS] No speechSynthesis"); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = useLang;
    u.rate = slow ? 0.75 : 1.05;
    const voices = synth.getVoices();
    const native = voices.find(v => v.lang === useLang) || voices.find(v => v.lang.startsWith(useLang.split("-")[0]));
    if (native) { u.voice = native; u.lang = native.lang; }
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = (e) => { console.warn("[TTS] browser err", e); setSpeaking(false); };
    synth.speak(u);
  }, []);

  const speak = useCallback(async (text: string, opts?: { lang?: string; rate?: string }) => {
    if (typeof window === "undefined" || !text) return;
    stopSpeaking();
    const useLang = opts?.lang || langRef.current;
    const slow = localStorage.getItem("slowSpeech") === "1";
    const rate = opts?.rate ?? (slow ? "-25%" : "5%");

    // Try Azure TTS
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: useLang, rate }),
      });
      const ct = res.headers.get("Content-Type") || "";
      if (res.ok && ct.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio();
        audio.preload = "auto";
        (audio as any).playsInline = true;
        audio.src = url;
        audioRef.current = audio;
        let started = false;
        audio.onplay = () => { started = true; setSpeaking(true); };
        audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
        audio.onerror = (e) => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
          // Only fall back if we never managed to play in the first place
          if (!started) { console.warn("[TTS] audio error before play, fallback", e); browserTTS(text, useLang, slow); }
        };
        try {
          await audio.play();
          return;
        } catch (err) {
          console.warn("[TTS] audio.play() rejected (autoplay?), using browser TTS", err);
          URL.revokeObjectURL(url);
        }
      } else {
        console.warn("[TTS] /api/tts not audio, status:", res.status, "ct:", ct);
      }
    } catch (apiErr) {
      console.warn("[TTS] /api/tts fetch failed, using browser TTS", apiErr);
    }

    browserTTS(text, useLang, slow);
  }, [stopSpeaking, browserTTS]);

  return { startListening, stopListening, speak, stopSpeaking, listening, speaking, transcript, supported };
}

