"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { en, type Translations } from "./locales/en";
import { ru } from "./locales/ru";
import { uz } from "./locales/uz";

export type Language = "en" | "ru" | "uz";

const LOCALES: Record<Language, Translations> = { en, ru, uz };
const STORAGE_KEY = "manzara-lang";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && stored in LOCALES) setLangState(stored);
  }, []);

  function setLang(next: Language) {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: LOCALES[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Translate a DB-stored value using a locale lookup map, falling back to the original */
export function td(map: Record<string, string>, value: string): string {
  return map[value] ?? value;
}
