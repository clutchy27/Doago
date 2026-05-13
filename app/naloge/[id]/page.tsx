"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";

type Sporocilo = {
  id: string;
  besedilo: string;
  createdAt: string;
  avtorId: string;
  avtorIme: string;
};

type Naloga = {
  id: string;
  naslov: string;
  opis: string;
  cena: number;
  kategorija: string;
  lokacija: string;
  status: string;
  createdAt: string;
  narocnikId: string;
  izvajalecId: string | null;
  narocnik: { ime: string };
  izvajalec: { ime: string } | null;
};

const statusBarva: Record<string, string> = {
  odprta: "bg-green-500/10 text-green-400 border border-green-500/20",
  sprejeta: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "v teku": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "plačano": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  zaprta: "bg-white/5 text-gray-500 border border-white/10",
};

function formatCas(iso: string) {
  return new Date(iso).toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" });
}

export default function NalogaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [naloga, setNaloga] = useState<Naloga | null>(null);
  const [sporocila, setSporocila] = useState<Sporocilo[]>([]);
  const [nalaganje, setNalaganje] = useState(true);
  const [novo, setNovo] = useState("");
  const [posiljam, setPosiljam] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/prijava");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/naloge/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setNaloga(data);
        setNalaganje(false);
      });
  }, [id, status]);

  const fetchSporocila = useCallback(() => {
    fetch(`/api/naloge/${id}/sporocila`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSporocila(data); });
  }, [id]);

  useEffect(() => {
    if (!naloga || naloga.status === "odprta") return;
    fetchSporocila();
    const interval = setInterval(fetchSporocila, 3000);
    return () => clearInterval(interval);
  }, [naloga?.status, fetchSporocila]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sporocila]);

  const posli = async () => {
    if (!novo.trim() || posiljam) return;
    setPosiljam(true);
    const res = await fetch(`/api/naloge/${id}/sporocila`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ besedilo: novo.trim() }),
    });
    if (res.ok) {
      const s = await res.json();
      setSporocila((prev) => [...prev, s]);
      setNovo("");
      inputRef.current?.focus();
    }
    setPosiljam(false);
  };

  if (status === "loading" || nalaganje) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-600">Nalaganje...</p>
      </div>
    );
  }

  if (!session || !naloga) return null;

  const userId = (session.user as any).id as string;
  const isParticipant = userId === naloga.narocnikId || userId === naloga.izvajalecId;
  const chatAvailable = naloga.status !== "odprta" && isParticipant;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav current="naloge" />

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-300 transition-colors duration-150 mb-6 flex items-center gap-1.5"
        >
          ← Nazaj
        </button>

        {/* Task details */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold text-white leading-snug">{naloga.naslov}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusBarva[naloga.status] ?? "bg-white/5 text-gray-500"}`}>
              {naloga.status}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed">{naloga.opis}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Cena</p>
              <p className="text-orange-500 font-bold text-lg">{naloga.cena} €</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Kategorija</p>
              <p className="text-gray-300">{naloga.kategorija}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Lokacija</p>
              <p className="text-gray-300">{naloga.lokacija}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Naročnik</p>
              <p className="text-gray-300">{naloga.narocnik.ime}</p>
            </div>
            {naloga.izvajalec && (
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Izvajalec</p>
                <p className="text-gray-300">{naloga.izvajalec.ime}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white text-sm">Sporočila</h2>
          </div>

          {!chatAvailable ? (
            <div className="px-6 py-10 text-center">
              <p className="text-gray-600 text-sm">
                {naloga.status === "odprta"
                  ? "Chat bo na voljo ko izvajalec sprejme nalogo."
                  : "Dostop do sporočil ni dovoljen."}
              </p>
            </div>
          ) : (
            <>
              <div className="h-80 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {sporocila.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center mt-8">Še ni sporočil. Začnite pogovor.</p>
                ) : (
                  sporocila.map((s) => {
                    const moje = s.avtorId === userId;
                    return (
                      <div key={s.id} className={`flex flex-col ${moje ? "items-end" : "items-start"}`}>
                        <span className="text-xs text-gray-600 mb-1 px-1">
                          {moje ? "Vi" : s.avtorIme} · {formatCas(s.createdAt)}
                        </span>
                        <div className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm break-words ${
                          moje
                            ? "bg-orange-500 text-white rounded-tr-sm"
                            : "bg-[#1a1a1a] text-gray-200 border border-white/5 rounded-tl-sm"
                        }`}>
                          {s.besedilo}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-white/5 flex gap-2">
                <input
                  ref={inputRef}
                  className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition-all"
                  placeholder="Napišite sporočilo..."
                  value={novo}
                  onChange={(e) => setNovo(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); posli(); } }}
                />
                <button
                  onClick={posli}
                  disabled={posiljam || !novo.trim()}
                  className="bg-orange-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-all duration-150 disabled:opacity-40 text-sm shrink-0"
                >
                  {posiljam ? "..." : "Pošlji"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
