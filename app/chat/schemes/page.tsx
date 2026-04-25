"use client";
import { useEffect, useState } from "react";
import ChatShell from "@/components/ChatShell";
import schemesData from "@/data/schemes.json";
import central from "@/data/central_schemes.json";
import { useLang } from "@/hooks/useLang";

export default function SchemesChat() {
  const { t } = useLang();
  const [state, setState] = useState("");
  const [profile, setProfile] = useState<any>({});
  useEffect(() => {
    setState(localStorage.getItem("state") || "Maharashtra");
    setProfile(JSON.parse(localStorage.getItem("profile") || "{}"));
  }, []);

  const stateSchemes = (schemesData as any)[state]?.schemes || [];
  const allSchemes = [...stateSchemes, ...central];

  // Compact summary: name + benefit + eligibility only. Saves ~80% tokens vs full JSON.
  const compact = (s: any) => `- ${s.name}: ${s.benefit}${s.eligibility ? ` (${s.eligibility})` : ""}`;
  const schemesSummary = [
    `State (${state}):`, ...stateSchemes.map(compact),
    `Central:`, ...central.map(compact),
  ].join("\n");

  const buildSystemPrompt = (langName: string) => `CRITICAL: Reply ONLY in ${langName} (native script). Never English unless ${langName} is English.

You are SarkarSathi, a friendly govt schemes assistant for ${state}.
User: ${profile.name || "Citizen"}, age ${profile.age || "?"}, income ${profile.income || "?"}, category ${profile.category || "General"}, gender ${profile.gender || "?"}.

Schemes available:
${schemesSummary}

Rules: Greet by name. Match schemes to user's profile. Warn if user mentions paying agents/fees (these are FREE). Keep replies under 3 short sentences. Simple language for low-literacy users.`;

  return (
    <ChatShell mode="schemes" buildSystemPrompt={buildSystemPrompt} schemes={allSchemes} prompts={t.qpSchemes} />
  );
}
