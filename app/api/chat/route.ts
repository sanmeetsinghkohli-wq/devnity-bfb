import { NextRequest, NextResponse } from "next/server";

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

    const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: "AI service not configured. Please set GROQ_API_KEY in .env.local.",
        fraudAlert,
      });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { reply: "Sorry, the AI service is temporarily unavailable.", fraudAlert, error: txt },
        { status: 200 }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "I couldn't generate a response.";
    return NextResponse.json({ reply, fraudAlert });
  } catch (e: any) {
    return NextResponse.json(
      { reply: "Network error. Please try again.", fraudAlert: false, error: e.message },
      { status: 200 }
    );
  }
}
