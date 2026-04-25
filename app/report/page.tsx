"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import schemesData from "@/data/schemes.json";
import central from "@/data/central_schemes.json";
import SchemeCard, { Scheme } from "@/components/SchemeCard";
import DocumentChecklist from "@/components/DocumentChecklist";
import { QRCodeSVG } from "qrcode.react";

import { ElegantShape } from "@/components/ui/shape-landing-hero";

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
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // ── Header: Official Tricolour Bar ──
      doc.setFillColor(255, 153, 51); // Saffron
      doc.rect(0, 0, pageWidth, 5, "F");
      doc.setFillColor(255, 255, 255); // White
      doc.rect(0, 5, pageWidth, 5, "F");
      doc.setFillColor(19, 136, 8); // Green
      doc.rect(0, 10, pageWidth, 5, "F");

      // ── Document Title & Branding ──
      doc.setTextColor(0, 0, 128); // Navy Blue
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("SARKARSATHI", 14, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text("India's Smart Eligibility Gateway", 14, 36);
      
      doc.setDrawColor(0, 0, 128);
      doc.setLineWidth(0.5);
      doc.line(14, 42, pageWidth - 14, 42);

      // ── Citizen Profile Section ──
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 48, pageWidth - 28, 30, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 48, pageWidth - 28, 30, "S");

      doc.setTextColor(0, 0, 128);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("CITIZEN ELIGIBILITY PROFILE", 20, 56);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.setFontSize(10);
      doc.text(`Name: ${profile.name || "N/A"}`, 20, 64);
      doc.text(`Location: ${state || "India"}`, 20, 71);
      doc.text(`Age: ${profile.age || "—"}  |  Income: INR ${profile.income || "—"}  |  Category: ${profile.category || "General"}`, 80, 64);
      doc.text(`Generated On: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 110, 71);

      // ── Matched Schemes List ──
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 128);
      doc.text("QUALIFIED SCHEMES & BENEFITS", 14, 90);
      
      let y = 98;
      matched.forEach((m, i) => {
        if (y > 250) { doc.addPage(); y = 20; }
        
        // Scheme Card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(200);
        doc.rect(14, y, pageWidth - 28, 32, "S");
        
        // Left Border Accent (Tricolour Cycle)
        const accentColors = [[255, 153, 51], [0, 0, 128], [19, 136, 8]];
        const color = accentColors[i % 3];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(14, y, 2, 32, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0);
        const title = `${i + 1}. ${m.s.name}`;
        doc.text(title, 20, y + 8);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(19, 136, 8); // Success Green for Benefit
        doc.text(`BENEFIT: ${m.s.benefit}`, 20, y + 14, { maxWidth: pageWidth - 40 });
        
        doc.setTextColor(80);
        doc.setFontSize(8);
        const docs = `DOCUMENTS: ${(m.s.documents || []).join(", ")}`;
        doc.text(docs, 20, y + 20, { maxWidth: pageWidth - 40 });

        if (m.s.officialUrl) {
          doc.setTextColor(0, 102, 204);
          doc.text(`PORTAL: ${m.s.officialUrl}`, 20, y + 26);
        }
        
        // Match Score Badge
        doc.setFillColor(240);
        doc.rect(pageWidth - 35, y + 4, 16, 6, "F");
        doc.setTextColor(0);
        doc.setFontSize(8);
        doc.text(`${m.score}%`, pageWidth - 32, y + 8);

        y += 38;
      });

      // ── Footer ──
      doc.setFontSize(8);
      doc.setTextColor(150);
      const footerTxt = "This is a computer-generated eligibility report. Visit sarkarsathi.vercel.app for real-time updates.";
      doc.text(footerTxt, pageWidth / 2, 285, { align: "center" });

      doc.save(`SarkarSathi_Report_${profile.name || "Citizen"}.pdf`);
    });
  }

  function shareWA() {
    const lines = matched.map(m => `• ${m.s.name} (${m.score}%) — ${m.s.benefit}`).join("\n");
    const txt = encodeURIComponent(`SarkarSathi found these schemes for me in ${state}:\n${lines}`);
    window.open(`https://wa.me/?text=${txt}`, "_blank");
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto fade-up relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/[0.05] via-transparent to-[#138808]/[0.05] blur-3xl" />
        <ElegantShape
          delay={0.3}
          width={400}
          height={100}
          rotate={12}
          gradient="from-[#FF9933]/[0.1]"
          className="left-[-10%] top-[10%]"
        />
        <ElegantShape
          delay={0.5}
          width={300}
          height={80}
          rotate={-15}
          gradient="from-[#138808]/[0.1]"
          className="right-[-5%] bottom-[20%]"
        />
      </div>

      <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-500 mb-6 text-sm hover:text-slate-900 transition-colors group font-semibold">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="glass-strong border border-white/20 rounded-[2.5rem] p-10 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
        <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-sm">Your Eligibility Report</h1>
        <p className="text-lg text-white/50 mt-4 font-bold uppercase tracking-wider">{profile.name || "Citizen"} <span className="mx-2 opacity-30">•</span> {state}</p>
        <div className="flex flex-wrap gap-4 mt-6">
           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 font-semibold uppercase tracking-widest leading-none">Age {profile.age || "—"}</span>
           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 font-semibold uppercase tracking-widest leading-none">Income ₹{profile.income || "—"}</span>
           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 font-semibold uppercase tracking-widest leading-none">{profile.category || "General"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={downloadPdf} 
          className="w-full bg-gradient-to-r from-primary via-white to-secondary text-slate-800 py-4 rounded-2xl font-black shadow-xl shadow-primary/15 border border-black/5 uppercase tracking-widest text-xs"
        >
          <span className="flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download PDF</span>
        </motion.button>
        <button onClick={shareWA} className="w-full bg-white text-slate-800 py-4 rounded-2xl font-black shadow-lg border border-slate-200 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4 text-secondary" /> WhatsApp
        </button>
      </div>

      <div className="space-y-8 relative z-10">
        {matched.map((m, i) => (
          <motion.div key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-4"
          >
            <SchemeCard scheme={m.s} score={m.score} />
            {m.s.documents && <DocumentChecklist docs={m.s.documents} />}
            {m.s.officialUrl && (
              <div className="glass border border-white/10 rounded-3xl p-6 flex items-center gap-5 shadow-lg">
                <div className="bg-white p-2 rounded-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <QRCodeSVG value={m.s.officialUrl} size={64} bgColor="#FFF" fgColor="#0F172A" />
                </div>
                <div>
                   <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5 leading-none">Official Portal QR</div>
                   <a href={m.s.officialUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-bold break-all">{m.s.officialUrl}</a>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <button onClick={() => router.push("/chat/schemes")} className="mt-12 w-full glass border border-white/10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all shadow-md">
        Back to Schemes chat
      </button>
    </main>
  );
}
