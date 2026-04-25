"use client";
import ChatShell from "@/components/ChatShell";
import services from "@/data/services.json";
import { useLang } from "@/hooks/useLang";

export default function ServicesChat() {
  const { t } = useLang();
  const buildSystemPrompt = (langName: string) => `You are SarkarSathi, a government services guide.
RESPOND ONLY IN ${langName}. Use native script. Simple language for low-literacy users.
Available services: ${JSON.stringify(services)}.
Always end with the official portal URL and required documents. Use numbered steps.
If user mentions paying agents/fees, warn immediately — these services are FREE.`;
  return <ChatShell mode="services" buildSystemPrompt={buildSystemPrompt} services={services} prompts={t.qpServices} />;
}
