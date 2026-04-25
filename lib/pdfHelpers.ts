// Strip non-Latin chars (jsPDF helvetica can't render Devanagari/Gujarati)
// Replace common symbols with Latin equivalents.
export function sanitizeForPdf(s: any): string {
  if (s == null) return "";
  return String(s)
    .replace(/₹/g, "Rs.")
    .replace(/[ऀ-ॿ઀-૿ঀ-৿஀-௿ఀ-౿ಀ-೿ഀ-ൿ]+/g, "[…]")
    .replace(/[—–]/g, "-")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[^\x00-\x7F]/g, "");
}
