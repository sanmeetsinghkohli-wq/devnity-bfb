import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const FRAUD_KEYWORDS = ["pay", "fees", "agent", "broker", "commission", "charge", "rupees for applying", "bribe"];

function detectFraud(text: string): boolean {
  const t = text.toLowerCase();
  return FRAUD_KEYWORDS.some(k => t.includes(k));
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();
    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
    const fraudAlert = lastUser ? detectFraud(lastUser.content) : false;

    // 1. Try Azure OpenAI first (Premium Enterprise Tier)
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      const endpoint = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_API_KEY,
        },
        body: JSON.stringify({
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.4,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content ?? "No reply from Azure.";
        return NextResponse.json({ reply, fraudAlert });
      }
      // If Azure fails, it will fall through to Gemini/Groq
    }

    // 2. Try Google Gemini (High Speed / High Limit)
    if (process.env.GOOGLE_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: systemPrompt });
        const history = messages.slice(0, -1).map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastUser?.content || "Namaste");
        return NextResponse.json({ reply: result.response.text(), fraudAlert });
      } catch {}
    }

    // 3. Fallback to Groq / xAI
    const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (apiKey) {
      const isXAI = apiKey.startsWith("xai-");
      const endpoint = isXAI ? "https://api.x.ai/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
      const modelName = process.env.GROQ_MODEL || (isXAI ? "grok-beta" : "llama-3.3-70b-versatile");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: modelName, messages: [{ role: "system", content: systemPrompt }, ...messages], temperature: 0.4 }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ reply: data.choices?.[0]?.message?.content || "No reply.", fraudAlert });
      }
    }

    return NextResponse.json({ reply: "All AI services currently busy. Please try again in a moment.", fraudAlert }, { status: 200 });

  } catch (e: any) {
    return NextResponse.json({ reply: "Network connection lost. Please try again.", fraudAlert: false, error: e.message }, { status: 200 });
  }
}
