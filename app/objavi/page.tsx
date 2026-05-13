"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Nav } from "@/components/Nav";

const KATEGORIJE = ["Hišna opravila", "Prevoz", "IT pomoč", "Pouk", "Vrtnarjenje", "Drugo"];

type CenaOcena = { ocena: "prenizka" | "primerna" | "previsoka"; razlaga: string } | null;

const ocenaStyle: Record<string, string> = {
  prenizka: "bg-red-500/10 border-red-500/20 text-red-400",
  primerna: "bg-green-500/10 border-green-500/20 text-green-400",
  previsoka: "bg-orange-500/10 border-orange-500/20 text-orange-400",
};

const ocenaBadge: Record<string, string> = {
  prenizka: "Prenizka",
  primerna: "Primerna",
  previsoka: "Previsoka",
};

export default function ObrazemObjave() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ naslov: "", opis: "", kategorija: KATEGORIJE[0], cena: "" });
  const [napaka, setNapaka] = useState("");
  const [posiljam, setPosiljam] = useState(false);
  const [ocena, setOcena] = useState<CenaOcena>(null);
  const [ocenjujem, setOcenjujem] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/prijava");
  }, [status, router]);

  useEffect(() => {
    if (!form.cena || !form.naslov || !form.kategorija) { setOcena(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setOcenjujem(true);
      try {
        const res = await fetch("/api/ai/cena", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) setOcena(await res.json());
        else setOcena(null);
      } catch {
        setOcena(null);
      } finally {
        setOcenjujem(false);
      }
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.naslov, form.kategorija, form.cena]);

  const objavi = async () => {
    if (!form.naslov || !form.opis || !form.cena) { setNapaka("Vsa polja so obvezna"); return; }
    setPosiljam(true);
    setNapaka("");
    const res = await fetch("/api/naloge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/naloge");
    } else {
      const data = await res.json();
      setNapaka(data.error || "Napaka pri objavi");
      setPosiljam(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-600">Nalaganje...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav current="objavi" />

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/naloge")}
            className="text-sm text-gray-600 hover:text-gray-300 transition-colors duration-150 flex items-center gap-1.5"
          >
            ← Nazaj
          </button>
          <span className="text-white/10">|</span>
          <h1 className="text-2xl font-bold text-white">Objavi nalogo</h1>
        </div>

        {napaka && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
            {napaka}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            className="bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            placeholder="Naslov naloge"
            value={form.naslov}
            onChange={(e) => setForm({ ...form, naslov: e.target.value })}
          />
          <textarea
            className="bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-all"
            placeholder="Opis naloge"
            rows={4}
            value={form.opis}
            onChange={(e) => setForm({ ...form, opis: e.target.value })}
          />
          <select
            className="bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            value={form.kategorija}
            onChange={(e) => setForm({ ...form, kategorija: e.target.value })}
          >
            {KATEGORIJE.map((k) => <option key={k} className="bg-[#111111]">{k}</option>)}
          </select>

          <div>
            <input
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="Cena (€)"
              type="number"
              min="0"
              value={form.cena}
              onChange={(e) => setForm({ ...form, cena: e.target.value })}
            />
            <div className="mt-2 min-h-[48px]">
              {ocenjujem && (
                <p className="text-xs text-gray-600 px-1">AI ocenjuje ceno...</p>
              )}
              {!ocenjujem && ocena && (
                <div className={`border rounded-xl px-4 py-2.5 text-sm ${ocenaStyle[ocena.ocena]}`}>
                  <span className="font-semibold">{ocenaBadge[ocena.ocena]}:</span>{" "}
                  {ocena.razlaga}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => router.push("/naloge")}
              className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl font-medium hover:bg-white/5 transition-all duration-150 text-sm"
            >
              Prekliči
            </button>
            <button
              onClick={objavi}
              disabled={posiljam}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 disabled:opacity-50 text-sm hover:shadow-lg hover:shadow-orange-500/20"
            >
              {posiljam ? "Objavljam..." : "Objavi nalogo"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
