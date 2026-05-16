"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { useMode } from "@/context/ModeContext";

type Naloga = {
  id: string;
  naslov: string;
  opis: string;
  cena: number;
  kategorija: string;
  lokacija: string;
  status: string;
  nujna: boolean;
  createdAt: string;
  narocnik?: { ime: string };
};

const KATEGORIJE = ["Vse", "Hišna opravila", "Prevoz", "IT pomoč", "Pouk", "Vrtnarjenje", "Drugo"];
const MESTA = ["Vsa mesta", "Ljubljana", "Maribor", "Celje", "Kranj", "Velenje", "Koper", "Novo mesto", "Ptuj", "Murska Sobota", "Nova Gorica", "Domžale", "Kamnik", "Trbovlje", "Krško", "Postojna", "Slovenj Gradec", "Jesenice", "Škofja Loka", "Brežice", "Izola"];

export default function VseNalogePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { mode, setMode } = useMode();

  const [naloge, setNaloge] = useState<Naloga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKat, setFilterKat] = useState("Vse");
  const [filterMesto, setFilterMesto] = useState("Vsa mesta");
  const [filterNujne, setFilterNujne] = useState(false);
  const [sprejemam, setSprejemam] = useState<string | null>(null);
  const [sporocilo, setSporocilo] = useState<string | null>(null);

  const isNarocnik = mode === "narocnik";
  const accentBg = "bg-[#22C55E]";
  const accentHover = "hover:bg-green-600";
  const accentText = "text-[#22C55E]";

  useEffect(() => {
    setMode("izvajalec");
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/prijava");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/naloge?pogled=izvajalec")
        .then((r) => r.json())
        .then((data) => { setNaloge(Array.isArray(data) ? data : []); setLoading(false); });
    }
  }, [status]);

  const sprejmi = async (id: string, naslov: string) => {
    setSprejemam(id);
    setSporocilo(null);
    const res = await fetch(`/api/naloge/${id}`, { method: "PATCH" });
    const data = await res.json();
    if (res.ok) {
      setNaloge((prev) => prev.filter((n) => n.id !== id));
      setSporocilo(`Naloga "${naslov}" uspešno sprejeta.`);
      setTimeout(() => setSporocilo(null), 4000);
    } else {
      setSporocilo(data.error || "Napaka pri sprejemu");
    }
    setSprejemam(null);
  };

  const filtered = naloge.filter((n) => {
    const katOk = filterKat === "Vse" || n.kategorija === filterKat;
    const mestoOk = filterMesto === "Vsa mesta" || n.lokacija.startsWith(filterMesto);
    const nujnaOk = !filterNujne || n.nujna;
    return katOk && mestoOk && nujnaOk;
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <p className="text-[#525252]">Nalaganje...</p>
      </div>
    );
  }
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Nav />

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/naloge")}
            className="text-sm text-[#525252] hover:text-[#A3A3A3] transition-colors duration-150 flex items-center gap-1.5 font-medium"
          >
            ← Nazaj
          </button>
          <span className="text-[#2A2A2A]">|</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Odprte naloge</h1>
          <span className="text-xs text-[#525252] bg-[#1A1A1A] border border-[#2A2A2A] px-2.5 py-1 rounded-full ml-1 font-medium">{filtered.length}</span>
        </div>

        {isNarocnik && (
          <div className="bg-[#F97316]/8 border border-[#F97316]/20 text-orange-300 rounded-xl px-4 py-3 text-sm mb-7">
            Stran je namenjena izvajalcem. Preklopite na <strong>Izvajalec</strong> način za sprejemanje nalog.
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">

          {/* Left sidebar */}
          <aside className="w-[200px] shrink-0 flex flex-col gap-5">

            {/* Nujne naloge toggle */}
            <button
              onClick={() => setFilterNujne(!filterNujne)}
              className={`w-full px-4 py-2.5 rounded-full border font-semibold text-sm transition-all duration-150 ${
                filterNujne
                  ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/25"
                  : "bg-[#1A1A1A] text-[#525252] border-red-500/50 hover:border-red-500/80 hover:text-red-400"
              }`}
            >
              🔴 Nujne naloge
            </button>

            <div className="h-px bg-[#2A2A2A]" />

            {/* Kategorija filter */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-[#525252] uppercase tracking-wider px-1 mb-1">Kategorija</p>
              {KATEGORIJE.map((k) => (
                <button
                  key={k}
                  onClick={() => setFilterKat(k)}
                  className={`text-xs px-3 py-2 rounded-xl border font-medium transition-all duration-150 text-left ${
                    filterKat === k
                      ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30"
                      : "bg-transparent text-[#525252] border-[#2A2A2A] hover:border-[#444444] hover:text-[#A3A3A3]"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="h-px bg-[#2A2A2A]" />

            {/* Lokacija filter */}
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-[#525252] uppercase tracking-wider px-1 mb-1">Lokacija</p>
              <select
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-sm text-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#22C55E] transition-all hover:border-[#333333] w-full"
                value={filterMesto}
                onChange={(e) => setFilterMesto(e.target.value)}
              >
                {MESTA.map((m) => <option key={m} className="bg-[#1A1A1A]">{m}</option>)}
              </select>
            </div>
          </aside>

          {/* Right main area */}
          <div className="flex-1 min-w-0">
            {sporocilo && (
              <div className="mb-5 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-xl px-4 py-3 text-sm">
                ✓ {sporocilo}
              </div>
            )}

            {loading ? (
              <p className="text-[#525252]">Nalaganje nalog...</p>
            ) : filtered.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-16 text-center">
                <p className="text-[#525252] text-sm">Trenutno ni odprtih nalog v tej kategoriji.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => router.push(`/naloge/${n.id}`)}
                    className={`rounded-2xl p-5 sm:p-6 flex items-start justify-between hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 cursor-pointer ${
                      n.nujna
                        ? "bg-[#1A1A1A] border border-red-500/30 shadow-[0_0_16px_rgba(239,68,68,0.07)] hover:border-red-500/50 hover:shadow-red-500/10"
                        : `bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#22C55E]/20 hover:shadow-green-500/5 ${filterNujne ? "opacity-40" : ""}`
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {n.nujna && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-wide whitespace-nowrap">
                            🔴 Nujno
                          </span>
                        )}
                        <h2 className="font-semibold text-white">{n.naslov}</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 whitespace-nowrap">
                          {n.kategorija}
                        </span>
                      </div>
                      <p className="text-[#A3A3A3] text-sm mb-3 line-clamp-2 leading-relaxed">{n.opis}</p>
                      <div className="flex gap-3 text-xs text-[#525252] flex-wrap items-center">
                        {n.lokacija && <span>📍 {n.lokacija}</span>}
                        {n.narocnik && <span>· Naročnik: {n.narocnik.ime}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2.5 shrink-0">
                      <span className={`${accentText} font-bold text-xl`}>{n.cena} €</span>
                      {!isNarocnik && (
                        <button
                          onClick={(e) => { e.stopPropagation(); sprejmi(n.id, n.naslov); }}
                          disabled={sprejemam === n.id}
                          className={`text-sm ${accentBg} ${accentHover} text-white px-4 py-1.5 rounded-xl transition-all duration-150 disabled:opacity-50 whitespace-nowrap font-semibold shadow-md hover:shadow-green-500/25`}
                        >
                          {sprejemam === n.id ? "Sprejemam..." : "Sprejmi"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
