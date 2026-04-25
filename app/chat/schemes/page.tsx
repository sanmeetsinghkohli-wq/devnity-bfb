"use client";
import { useEffect, useState } from "react";
import ChatShell from "@/components/ChatShell";
import schemesData from "@/data/schemes.json";
import central from "@/data/central_schemes.json";

export default function SchemesChat() {
  const [state, setState] = useState("");
  const [profile, setProfile] = useState<any>({});
  useEffect(() => {
    setState(localStorage.getItem("state") || "Maharashtra");
    setProfile(JSON.parse(localStorage.getItem("profile") || "{}"));
  }, []);

  const stateSchemes = (schemesData as any)[state]?.schemes || [];
  const allSchemes = [...stateSchemes, ...central];

  const systemPrompt = `You are SarkarSathi, a warm government schemes assistant for ${state}.
User profile: ${JSON.stringify(profile)}.
Available state schemes: ${JSON.stringify(stateSchemes)}.
Central schemes: ${JSON.stringify(central)}.
Detect if user mentions paying for a free service and warn them immediately.
Keep answers under 4 sentences. Ask eligibility questions one at a time.
Always remind: government schemes are FREE — never pay middlemen.`;

  return (
    <ChatShell mode="schemes" systemPrompt={systemPrompt} schemes={allSchemes}
      prompts={[
        "What schemes am I eligible for?",
        "Schemes for women",
        "Farmer schemes",
        "Housing schemes",
        "Health insurance",
      ]} />
  );
}
