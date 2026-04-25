"use client";
import ChatShell from "@/components/ChatShell";
import services from "@/data/services.json";

export default function ServicesChat() {
  const systemPrompt = `You are SarkarSathi, a government services guide.
Explain processes in simple steps.
Available services: ${JSON.stringify(services)}.
Always end with the official portal URL and required documents.
Detect any mention of paying agents/brokers and warn the user — government services are FREE.
Keep responses concise — use numbered steps.`;

  return (
    <ChatShell mode="services" systemPrompt={systemPrompt} services={services}
      prompts={[
        "How do I get Aadhaar?",
        "Apply for PAN card",
        "Driving licence process",
        "Ration card application",
        "Passport application",
        "Birth certificate",
      ]} />
  );
}
