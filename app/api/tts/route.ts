import { NextRequest, NextResponse } from "next/server";

const VOICE_BY_LANG: Record<string, string> = {
  "en-IN": "en-IN-NeerjaNeural",
  "hi-IN": "hi-IN-SwaraNeural",
  "mr-IN": "mr-IN-AarohiNeural",
  "gu-IN": "gu-IN-DhwaniNeural",
};

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "en-IN", rate = "0%" } = await req.json();
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || "eastus";
    if (!key) return NextResponse.json({ error: "azure_not_configured" }, { status: 501 });

    const voice = VOICE_BY_LANG[lang] || VOICE_BY_LANG["en-IN"];
    const ssml = `<speak version='1.0' xml:lang='${lang}'><voice name='${voice}'><prosody rate='${rate}'>${escapeXml(text)}</prosody></voice></speak>`;

    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "SarkarSathi",
      },
      body: ssml,
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: t }, { status: 502 });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return new NextResponse(buf, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}
