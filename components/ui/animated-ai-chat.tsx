"use client";

import { useEffect, useRef, useCallback, useTransition, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ImageIcon, Figma, MonitorIcon, ArrowUpIcon, Paperclip, SendIcon,
  XIcon, LoaderIcon, Sparkles, Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

interface UseAutoResizeTextareaProps { minHeight: number; maxHeight?: number; }

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback((reset?: boolean) => {
    const ta = textareaRef.current; if (!ta) return;
    if (reset) { ta.style.height = `${minHeight}px`; return; }
    ta.style.height = `${minHeight}px`;
    const h = Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY));
    ta.style.height = `${h}px`;
  }, [minHeight, maxHeight]);
  useEffect(() => { const ta = textareaRef.current; if (ta) ta.style.height = `${minHeight}px`; }, [minHeight]);
  useEffect(() => { const r = () => adjustHeight(); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, [adjustHeight]);
  return { textareaRef, adjustHeight };
}

interface CommandSuggestion { icon: React.ReactNode; label: string; description: string; prefix: string; }

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string; showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showRing && isFocused && (
          <motion.span
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export function AnimatedAIChat({
  onSubmit,
  placeholder = "Ask SarkarSathi a question...",
}: { onSubmit?: (text: string) => void; placeholder?: string }) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [, startTransition] = useTransition();
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [, setRecentCommand] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef<HTMLDivElement>(null);

  const commandSuggestions: CommandSuggestion[] = [
    { icon: <ImageIcon className="w-4 h-4" />, label: "Schemes", description: "Find eligible schemes", prefix: "/schemes" },
    { icon: <Figma className="w-4 h-4" />, label: "Aadhaar", description: "Aadhaar process", prefix: "/aadhaar" },
    { icon: <MonitorIcon className="w-4 h-4" />, label: "PAN", description: "PAN card process", prefix: "/pan" },
    { icon: <Sparkles className="w-4 h-4" />, label: "Health", description: "Health schemes", prefix: "/health" },
  ];

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);
      const idx = commandSuggestions.findIndex(c => c.prefix.startsWith(value));
      setActiveSuggestion(idx);
    } else setShowCommandPalette(false);
  }, [value]);

  useEffect(() => {
    const h = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h); return () => window.removeEventListener("mousemove", h);
  }, []);

  useEffect(() => {
    const h = (event: MouseEvent) => {
      const target = event.target as Node;
      const cb = document.querySelector("[data-command-button]");
      if (commandPaletteRef.current && !commandPaletteRef.current.contains(target) && !cb?.contains(target)) setShowCommandPalette(false);
    };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSendMessage = () => {
    if (!value.trim()) return;
    const text = value;
    onSubmit?.(text);
    startTransition(() => {
      setIsTyping(true);
      setTimeout(() => { setIsTyping(false); setValue(""); adjustHeight(true); }, 800);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveSuggestion(p => p < commandSuggestions.length - 1 ? p + 1 : 0); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActiveSuggestion(p => p > 0 ? p - 1 : commandSuggestions.length - 1); }
      else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const s = commandSuggestions[activeSuggestion];
          setValue(s.prefix + " "); setShowCommandPalette(false);
          setRecentCommand(s.label); setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === "Escape") { e.preventDefault(); setShowCommandPalette(false); }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); if (value.trim()) handleSendMessage();
    }
  };

  const handleAttachFile = () => setAttachments(p => [...p, `file-${Math.floor(Math.random() * 1000)}.pdf`]);
  const removeAttachment = (i: number) => setAttachments(p => p.filter((_, idx) => idx !== i));
  const selectCommandSuggestion = (i: number) => {
    const s = commandSuggestions[i];
    setValue(s.prefix + " "); setShowCommandPalette(false);
    setRecentCommand(s.label); setTimeout(() => setRecentCommand(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-center bg-transparent text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-rose-500/10 rounded-full filter blur-[96px] animate-pulse delay-1000" />
      </div>
      <div className="w-full max-w-2xl mx-auto relative">
        <motion.div className="relative z-10 space-y-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center space-y-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                How can I help today?
              </h1>
              <motion.div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.5, duration: 0.8 }} />
            </motion.div>
            <p className="text-sm text-white/40">Type a command or ask a question</p>
          </div>

          <motion.div className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
            initial={{ scale: 0.98 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
            <AnimatePresence>
              {showCommandPalette && (
                <motion.div ref={commandPaletteRef}
                  className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}>
                  <div className="py-1 bg-black/95">
                    {commandSuggestions.map((s, i) => (
                      <motion.div key={s.prefix}
                        className={cn("flex items-center gap-2 px-3 py-2 text-xs cursor-pointer",
                          activeSuggestion === i ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5")}
                        onClick={() => selectCommandSuggestion(i)}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <div className="w-5 h-5 flex items-center justify-center text-white/60">{s.icon}</div>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-white/40 text-xs ml-1">{s.prefix}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4">
              <Textarea ref={textareaRef} value={value}
                onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)}
                placeholder={placeholder} containerClassName="w-full"
                className={cn("w-full px-4 py-3 resize-none bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/20 min-h-[60px]")}
                style={{ overflow: "hidden" }} showRing={false} />
            </div>

            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div className="px-4 pb-3 flex gap-2 flex-wrap"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  {attachments.map((file, index) => (
                    <motion.div key={index} className="flex items-center gap-2 text-xs bg-white/[0.03] py-1.5 px-3 rounded-lg text-white/70"
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <span>{file}</span>
                      <button onClick={() => removeAttachment(index)} className="text-white/40 hover:text-white"><XIcon className="w-3 h-3" /></button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.button type="button" onClick={handleAttachFile} whileTap={{ scale: 0.94 }}
                  className="p-2 text-white/40 hover:text-white/90 rounded-lg relative group">
                  <Paperclip className="w-4 h-4" />
                </motion.button>
                <motion.button type="button" data-command-button
                  onClick={(e) => { e.stopPropagation(); setShowCommandPalette(p => !p); }}
                  whileTap={{ scale: 0.94 }}
                  className={cn("p-2 text-white/40 hover:text-white/90 rounded-lg relative group", showCommandPalette && "bg-white/10 text-white/90")}>
                  <Command className="w-4 h-4" />
                </motion.button>
              </div>
              <motion.button type="button" onClick={handleSendMessage}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                disabled={isTyping || !value.trim()}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2",
                  value.trim() ? "bg-primary text-black shadow-lg shadow-primary/30" : "bg-white/[0.05] text-white/40")}>
                {isTyping ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                <span>Send</span>
              </motion.button>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {commandSuggestions.map((s, i) => (
              <motion.button key={s.prefix} onClick={() => selectCommandSuggestion(i)}
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-sm text-white/60 hover:text-white/90 relative group"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                {s.icon}<span>{s.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {inputFocused && (
        <motion.div className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.04] bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 blur-[96px]"
          animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }} />
      )}
    </div>
  );
}
