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

    // 1. Try Google Gemini first (Low latency, High Rate Limits)
    if (process.env.GOOGLE_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt 
      });

      const history = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastUser?.content || "Namaste");
      const reply = result.response.text();
      
      return NextResponse.json({ reply, fraudAlert });
    }

    // 2. Fallback to Groq / xAI
    const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "AI service not configured. Please set GOOGLE_API_KEY or GROQ_API_KEY.",
        fraudAlert,
      });
    }

    const isXAI = apiKey.startsWith("xai-");
    const endpoint = isXAI 
      ? "https://api.x.ai/v1/chat/completions" 
      : "https://api.groq.com/openai/v1/chat/completions";

    const defaultModel = isXAI ? "grok-beta" : "llama-3.3-70b-versatile";
    const modelName = process.env.GROQ_MODEL || process.env.GROK_MODEL || defaultModel;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ reply: "AI Service Error: " + (err.error?.message || "Unknown"), fraudAlert }, { status: 200 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "No reply.";
    return NextResponse.json({ reply, fraudAlert });

  } catch (e: any) {
    return NextResponse.json({ reply: "Connection lost. Please check internet.", fraudAlert: false, error: e.message }, { status: 200 });
  }
}
