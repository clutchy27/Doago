"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Mode = "narocnik" | "izvajalec";

const ACCENT: Record<Mode, string> = {
  narocnik: "#F97316",
  izvajalec: "#22C55E",
};

interface ModeContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
  accent: string;
}

const ModeContext = createContext<ModeContextValue>({
  mode: "narocnik",
  setMode: () => {},
  accent: ACCENT.narocnik,
});

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("narocnik");

  useEffect(() => {
    const saved = localStorage.getItem("doagoMode") as Mode | null;
    if (saved === "narocnik" || saved === "izvajalec") setModeState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", ACCENT[mode]);
  }, [mode]);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem("doagoMode", m);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, accent: ACCENT[mode] }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
