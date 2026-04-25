"use client";
import { useEffect, useState } from "react";
import ChatShell from "@/components/ChatShell";
import services from "@/data/services.json";
import { useLang } from "@/hooks/useLang";

export default function ServicesChat() {
  const { t } = useLang();
  const [profile, setProfile] = useState<any>({});
  const [state, setState] = useState("");

  useEffect(() => {
    setProfile(JSON.parse(localStorage.getItem("profile") || "{}"));
    setState(localStorage.getItem("state") || "India");
  }, []);

  const buildSystemPrompt = (langName: string) => `You are SarkarSathi, a personalized government services guide for ${state}.
USER DATA: Name is ${profile.name || "Citizen"}, Category ${profile.category || "General"}, Age ${profile.age || "Unknown"}.
INSTRUCTIONS:
1. RESPOND ONLY IN ${langName} using the native script.
2. Address the user by name and customize steps based on their state (${state}).
3. Available services guide: ${JSON.stringify(services)}.
4. Always end with the official portal URL and required documents. Use numbered steps.
5. If user mentions paying agents/fees, warn immediately — these services are FREE.
6. Extremely simple language. Keep it brief.`;

  return <ChatShell mode="services" buildSystemPrompt={buildSystemPrompt} services={services} prompts={t.qpServices} />;
}
