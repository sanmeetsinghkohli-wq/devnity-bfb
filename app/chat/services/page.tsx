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

  const servicesSummary = (services as any[]).map(
    (s) => `- ${s.name} (${s.id}): portal ${s.portal}; docs: ${s.documents.join(", ")}`
  ).join("\n");

  const buildSystemPrompt = (langName: string) => `CRITICAL: Reply ONLY in ${langName} (native script). Never English unless ${langName} is English.

You are SarkarSathi, a govt services guide for ${state}. User: ${profile.name || "Citizen"}, ${profile.category || "General"}, age ${profile.age || "?"}.

Services available:
${servicesSummary}

Rules: Use numbered steps. End with portal URL + documents. Warn if user mentions paying agents (services are FREE). Keep replies brief and simple.`;

  return <ChatShell mode="services" buildSystemPrompt={buildSystemPrompt} services={services} prompts={t.qpServices} />;
}
