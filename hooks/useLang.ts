"use client";
import { useEffect, useState } from "react";
import { Lang, T, LANG_META, getLang } from "@/lib/i18n";

export function useLang() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => { setLang(getLang()); }, []);
  return { lang, t: T[lang], meta: LANG_META[lang] };
}
