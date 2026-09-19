import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { localeMeta, text, type Locale, type Translation } from "@/lib/content";
export type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: Translation };
export const LocaleContext = createContext<LocaleContextValue | null>(null);
const isLocale = (value: string | null): value is Locale => Boolean(value && value in localeMeta);
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => { const saved = localStorage.getItem("icx-locale"); return isLocale(saved) ? saved : "fr"; });
  useEffect(() => { localStorage.setItem("icx-locale", locale); document.documentElement.lang = locale; document.documentElement.dir = localeMeta[locale].dir; }, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: text(locale) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useLocale() { const value = useContext(LocaleContext); if (!value) throw new Error("useLocale must be used inside LocaleProvider"); return value; }
