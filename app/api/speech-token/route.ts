import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return NextResponse.json({ error: "Azure Speech credentials missing" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "Failed to fetch token", details: err }, { status: 500 });
    }

    const token = await res.text();
    return NextResponse.json({ token, region });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
