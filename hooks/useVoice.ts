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
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, opts?: { lang?: string; rate?: string }) => {
    if (typeof window === "undefined" || !text) return;
    stopSpeaking();
    const useLang = opts?.lang || langRef.current;
    const slow = localStorage.getItem("slowSpeech") === "1";
    const rate = opts?.rate ?? (slow ? "-25%" : "10%"); // Default slightly faster for snapiness

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
        audio.onerror = () => setSpeaking(false);
        await audio.play();
        return;
      }
    } catch (apiErr) {
      console.error("Azure TTS failed, falling back to browser", apiErr);
    }

    // Fallback: browser TTS
    const synth = window.speechSynthesis;
    if (!synth) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = useLang;
    u.rate = slow ? 0.75 : 1.1;

    // FIND NATIVE VOICE (To avoid English accent)
    const voices = synth.getVoices();
    const nativeVoice = voices.find(v => (v.lang.startsWith(useLang) || v.lang.includes(useLang.split("-")[0])) && 
       (v.name.includes("Google") || v.name.includes("Neural") || v.name.includes("Natural")));
    
    if (nativeVoice) {
      u.voice = nativeVoice;
      // Some browsers need the lang to match the voice exactly
      u.lang = nativeVoice.lang;
    }

    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    synth.speak(u);
  }, [stopSpeaking]);

  return { startListening, stopListening, speak, stopSpeaking, listening, speaking, transcript, supported };
}

