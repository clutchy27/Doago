"use client";
import { useState } from "react";

export type ApprovalTask = {
  nalogaId: string;
  naslovNaloge: string;
  izvajalecIme: string;
  izvajalecVloga: string;
  izvajalecOpis?: string | null;
  izvajalecKategorije?: string | null;
  izvajalecMesta?: string | null;
  izvajalecPovprecnaOcena?: number | null;
  izvajalecSteviloOpravljenih: number;
};

type Props = {
  naloga: ApprovalTask;
  isNarocnik: boolean;
  onZakljuceno: () => void;
};

export default function IzvajalecApprovalModal({ naloga, isNarocnik, onZakljuceno }: Props) {
  const [loading, setLoading] = useState<"potrdi" | "zavrni" | null>(null);

  const initials = naloga.izvajalecIme
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isSP = naloga.izvajalecVloga === "sp";
  const accentBg = isNarocnik ? "bg-[#F97316]" : "bg-[#22C55E]";
  const stars = naloga.izvajalecPovprecnaOcena ?? 0;
  const kategorije = naloga.izvajalecKategorije ? naloga.izvajalecKategorije.split(",").filter(Boolean) : [];
  const mesta = naloga.izvajalecMesta ? naloga.izvajalecMesta.split(",").filter(Boolean) : [];

  const odloci = async (action: "potrdi" | "zavrni") => {
    setLoading(action);
    try {
      await fetch(`/api/naloge/${naloga.nalogaId}/potrdi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      onZakljuceno();
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/75">
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl w-full max-w-md p-8 shadow-2xl shadow-black/60">

        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🙋</div>
          <h2 className="text-xl font-bold text-white tracking-tight">Izvajalec želi sprejeti vašo nalogo!</h2>
          <p className="text-[#525252] text-sm mt-1.5">
            Naloga: <span className="text-[#A3A3A3]">{naloga.naslovNaloge}</span>
          </p>
        </div>

        <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${accentBg} flex items-center justify-center shrink-0`}>
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-white font-semibold">{naloga.izvajalecIme}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                  isSP
                    ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                    : "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/25"
                }`}>
                  {isSP ? "s.p." : "študent"}
                </span>
              </div>

              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= Math.round(stars) ? "text-amber-400" : "text-[#333333]"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs text-[#525252] ml-1">
                  {stars > 0 ? stars.toFixed(1) : "Brez ocen"}
                </span>
              </div>

              <p className="text-xs text-[#525252]">
                {naloga.izvajalecSteviloOpravljenih}{" "}
                {naloga.izvajalecSteviloOpravljenih === 1 ? "opravljena naloga" : "opravljenih nalog"}
              </p>
            </div>
          </div>

          {(naloga.izvajalecOpis || kategorije.length > 0 || mesta.length > 0) && (
            <div className="mt-4 pt-4 border-t border-[#2A2A2A] flex flex-col gap-3">
              {naloga.izvajalecOpis && (
                <p className="text-sm text-[#A3A3A3] leading-relaxed line-clamp-3">
                  {naloga.izvajalecOpis}
                </p>
              )}
              {kategorije.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {kategorije.map((k) => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      {k}
                    </span>
                  ))}
                </div>
              )}
              {mesta.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {mesta.map((m) => (
                    <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-[#2A2A2A] text-[#A3A3A3] border border-[#333333]">
                      📍 {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => odloci("zavrni")}
            disabled={loading !== null}
            className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl font-semibold hover:bg-red-500/20 transition-all duration-150 text-sm disabled:opacity-50"
          >
            {loading === "zavrni" ? "Zavračam..." : "❌ Zavrni"}
          </button>
          <button
            onClick={() => odloci("potrdi")}
            disabled={loading !== null}
            className="flex-1 bg-[#22C55E] hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all duration-150 text-sm disabled:opacity-50 shadow-lg hover:shadow-green-500/25"
          >
            {loading === "potrdi" ? "Potrjujem..." : "✅ Sprejmi izvajalca"}
          </button>
        </div>
      </div>
    </div>
  );
}
