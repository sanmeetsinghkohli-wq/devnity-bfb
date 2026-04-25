import { NextRequest, NextResponse } from "next/server";

// Map standard ISO locales to Bhashini's language codes (ISO 639-1)
const BHASHINI_LANG: Record<string, string> = {
  "en-IN": "en",
  "hi-IN": "hi",
  "mr-IN": "mr",
  "gu-IN": "gu",
};

// Azure TTS fallback voices
const AZURE_VOICES: Record<string, string> = {
  "en-IN": "en-IN-NeerjaNeural",
  "hi-IN": "hi-IN-SwaraNeural",
  "mr-IN": "mr-IN-AarohiNeural",
  "gu-IN": "gu-IN-DhwaniNeural",
};

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "en-IN", rate = "0%" } = await req.json();

    // Bhashini API Credentials
    const userId = process.env.BHASHINI_USER_ID;
    const apiKey = process.env.BHASHINI_API_KEY;
    const pipelineId = process.env.BHASHINI_PIPELINE_ID;

    // Use Bhashini if keys exist
    if (userId && apiKey && pipelineId) {
      const bhashiniLangCode = BHASHINI_LANG[lang] || "en";

      const pipelineReq = await fetch("https://meity-auth.ulcacore.in/ulca/apis/v0/model/getModelsPipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json", "userID": userId, "ulcaApiKey": apiKey },
        body: JSON.stringify({
          pipelineTasks: [{ taskType: "tts" }],
          pipelineRequestConfig: { pipelineId: pipelineId },
        }),
      });

      if (pipelineReq.ok) {
        const pipelineData = await pipelineReq.json();
        const ttsTask = pipelineData?.pipelineResponseConfig?.[0];
        
        if (ttsTask && ttsTask.config[0]?.serviceId) {
          const serviceId = ttsTask.config[0].serviceId;
          const inferenceApiKey = pipelineData.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value;
          const inferenceCallbackUrl = pipelineData.pipelineInferenceAPIEndPoint?.callbackUrl;

          if (inferenceApiKey && inferenceCallbackUrl) {
            const inferenceReq = await fetch(inferenceCallbackUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": inferenceApiKey },
              body: JSON.stringify({
                pipelineTasks: [{
                  taskType: "tts",
                  config: { language: { sourceLanguage: bhashiniLangCode }, serviceId, gender: "female", samplingRate: 44100 }
                }],
                inputData: { input: [{ source: text }] }
              }),
            });

            if (inferenceReq.ok) {
              const inferenceData = await inferenceReq.json();
              const audioBase64 = inferenceData?.pipelineResponse?.[0]?.audio?.[0]?.audioContent;
              if (audioBase64) {
                return new NextResponse(Buffer.from(audioBase64, "base64"), { 
                  headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" } 
                });
              }
            }
          }
        }
      }
    }

    // ── FALLBACK TO AZURE TTS ──
    const azureKey = process.env.AZURE_SPEECH_KEY;
    const azureRegion = process.env.AZURE_SPEECH_REGION || "eastus";

    if (azureKey) {
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

      if (!res.ok) throw new Error(await res.text());
      const buf = Buffer.from(await res.arrayBuffer());
      return new NextResponse(buf, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ error: "no_tts_keys_configured" }, { status: 501 });
  } catch (e: any) {
    console.error("TTS Failure: ", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}
