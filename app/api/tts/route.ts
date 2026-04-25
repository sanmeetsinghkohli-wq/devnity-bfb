import { NextRequest, NextResponse } from "next/server";

const AZURE_VOICES: Record<string, string> = {
  "en-IN": "en-IN-NeerjaNeural",
  "hi-IN": "hi-IN-SwaraNeural",
  "mr-IN": "mr-IN-AarohiNeural",
  "gu-IN": "gu-IN-DhwaniNeural",
};

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "en-IN", rate = "0%" } = await req.json();

    const azureKey = process.env.AZURE_SPEECH_KEY;
    const azureRegion = process.env.AZURE_SPEECH_REGION || "eastus";

    if (!azureKey) {
      console.warn("Azure Speech Key not configured.");
      return NextResponse.json({ error: "no_tts_keys_configured" }, { status: 501 });
    }

    const voice = AZURE_VOICES[lang] || AZURE_VOICES["en-IN"];
    const ssml = `<speak version='1.0' xml:lang='${lang}'><voice name='${voice}'><prosody rate='${rate}'>${escapeXml(text)}</prosody></voice></speak>`;

    const res = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azureKey,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "SarkarSathi",
      },
      body: ssml,
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Azure TTS Error:", errorText);
        throw new Error(errorText);
    }
    
    const arrayBuffer = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    
    return new NextResponse(buf, { 
        headers: { 
            "Content-Type": "audio/mpeg", 
            "Cache-Control": "no-store" 
        } 
    });
  } catch (e: any) {
    console.error("TTS Failure: ", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}
