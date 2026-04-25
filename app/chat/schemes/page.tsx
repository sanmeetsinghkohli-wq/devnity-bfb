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

  const buildSystemPrompt = (langName: string) => `You are SarkarSathi, a warm government schemes assistant for ${state}.
RESPOND ONLY IN ${langName}. Use the native script. Keep tone friendly and simple — for low-literacy users.
User profile: ${JSON.stringify(profile)}.
State schemes: ${JSON.stringify(stateSchemes)}.
Central schemes: ${JSON.stringify(central)}.
If user mentions paying any agent/broker/fees, immediately warn — these are FREE government schemes.
Keep answers under 4 short sentences. Ask eligibility questions one at a time.`;

  return (
    <ChatShell mode="schemes" buildSystemPrompt={buildSystemPrompt} schemes={allSchemes} prompts={t.qpSchemes} />
  );
}
