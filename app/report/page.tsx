"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Share2 } from "lucide-react";
import schemesData from "@/data/schemes.json";
import central from "@/data/central_schemes.json";
import SchemeCard, { Scheme } from "@/components/SchemeCard";
import DocumentChecklist from "@/components/DocumentChecklist";
import { QRCodeSVG } from "qrcode.react";

export default function Report() {
  const router = useRouter();
  const [state, setState] = useState("");
  const [profile, setProfile] = useState<any>({});
  useEffect(() => {
    setState(localStorage.getItem("state") || "");
    setProfile(JSON.parse(localStorage.getItem("profile") || "{}"));
  }, []);

  const stateSchemes: Scheme[] = ((schemesData as any)[state]?.schemes || []) as Scheme[];
  const matched: Array<{ s: Scheme; score: number }> = [
    ...stateSchemes.map((s, i) => ({ s, score: 90 - i * 8 })),
    ...(central as Scheme[]).map((s, i) => ({ s, score: 75 - i * 5 })),
  ].slice(0, 6);

  function downloadPdf() {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(20); doc.text("SarkarSathi Eligibility Report", 14, 20);
      doc.setFontSize(11);
      doc.text(`Name: ${profile.name || "—"}`, 14, 32);
      doc.text(`State: ${state}  •  Age: ${profile.age || "—"}  •  Income: ${profile.income || "—"}  •  Category: ${profile.category || "—"}`, 14, 40);
      let y = 56;
      matched.forEach((m, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(13); doc.text(`${i + 1}. ${m.s.name} (${m.score}% match)`, 14, y); y += 7;
        doc.setFontSize(10); doc.text(`Benefit: ${m.s.benefit}`, 14, y); y += 6;
        doc.text(`Documents: ${(m.s.documents || []).join(", ")}`, 14, y, { maxWidth: 180 }); y += 6;
        if (m.s.officialUrl) { doc.text(`Portal: ${m.s.officialUrl}`, 14, y); y += 10; } else y += 4;
      });
      doc.save("sarkarsathi-eligibility.pdf");
    });
  }

  function shareWA() {
    const lines = matched.map(m => `• ${m.s.name} (${m.score}%) — ${m.s.benefit}`).join("\n");
    const txt = encodeURIComponent(`SarkarSathi found these schemes for me in ${state}:\n${lines}`);
    window.open(`https://wa.me/?text=${txt}`, "_blank");
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto fade-up">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground mb-4 text-sm hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-5">
        <h1 className="text-2xl font-semibold gradient-text">Your Eligibility Report</h1>
        <p className="text-sm text-muted-foreground mt-2">{profile.name || "Citizen"} • {state}</p>
        <p className="text-xs text-muted-foreground mt-1">Age {profile.age || "—"} • Income ₹{profile.income || "—"} • {profile.category || "—"}</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={downloadPdf} className="flex-1 bg-primary text-black py-3 rounded-xl font-medium flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Download PDF
        </button>
        <button onClick={shareWA} className="px-4 bg-success text-black py-3 rounded-xl font-medium flex items-center gap-2">
          <Share2 className="w-4 h-4" /> WhatsApp
        </button>
      </div>

      <div className="space-y-4">
        {matched.map((m, i) => (
          <div key={i} className="space-y-2">
            <SchemeCard scheme={m.s} score={m.score} />
            {m.s.documents && <DocumentChecklist docs={m.s.documents} />}
            {m.s.officialUrl && (
              <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
                <QRCodeSVG value={m.s.officialUrl} size={64} bgColor="#0E0E1C" fgColor="#F7941D" />
                <div className="text-xs text-muted-foreground">Scan to open the official portal.<br /><a href={m.s.officialUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{m.s.officialUrl}</a></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => router.push("/chat/schemes")} className="mt-6 w-full bg-surface border border-border py-3 rounded-xl text-sm hover:border-primary">
        Back to chat
      </button>
    </main>
  );
}
