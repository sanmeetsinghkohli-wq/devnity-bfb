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

  const buildSystemPrompt = (langName: string) => `**CRITICAL LANGUAGE RULE**: You MUST reply ONLY in ${langName}, using its native script. NEVER use English unless ${langName} is English. Even if the user writes in English or mixed language, your response MUST be 100% in ${langName} script. This is non-negotiable.

You are SarkarSathi, a personalized government schemes mentor for ${state}.
PERSONALIZATION: The user is ${profile.name || "a Citizen"}. Age: ${profile.age || "Unknown"}. Monthly Income: INR ${profile.income || "Unknown"}. Category: ${profile.category || "General"}.
INSTRUCTIONS:
1. Greet the user by name if known.
2. ALWAYS prioritize schemes that match their specific profile (State: ${state}, Category: ${profile.category || "General"}).
3. RESPOND ONLY IN ${langName} using the native script. 
4. Keep tone warm, friendly, and extremely simple for low-literacy users.
5. If user mentions paying any agent/broker/fees, immediately warn that these are FREE government schemes.
6. Data for reference - State schemes: ${JSON.stringify(stateSchemes)}. Central schemes: ${JSON.stringify(central)}.
7. Keep answers under 4 short sentences.`;

  return (
    <ChatShell mode="schemes" buildSystemPrompt={buildSystemPrompt} schemes={allSchemes} prompts={t.qpSchemes} />
  );
}
