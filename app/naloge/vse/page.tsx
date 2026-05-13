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
  createdAt: string;
  narocnik?: { ime: string };
};

const KATEGORIJE = ["Vse", "Hišna opravila", "Prevoz", "IT pomoč", "Pouk", "Vrtnarjenje", "Drugo"];
const MESTA = ["Vsa mesta", "Ljubljana", "Maribor", "Celje", "Kranj", "Velenje", "Koper", "Novo mesto", "Ptuj", "Murska Sobota", "Nova Gorica", "Domžale", "Kamnik", "Trbovlje", "Krško", "Postojna", "Slovenj Gradec", "Jesenice", "Škofja Loka", "Brežice", "Izola"];

export default function VseNalogePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { mode } = useMode();

  const [naloge, setNaloge] = useState<Naloga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKat, setFilterKat] = useState("Vse");
  const [filterMesto, setFilterMesto] = useState("Vsa mesta");
  const [sprejemam, setSprejemam] = useState<string | null>(null);
  const [sporocilo, setSporocilo] = useState<string | null>(null);

  const isNarocnik = mode === "narocnik";
  const accentBg = "bg-[#22C55E]";
  const accentHover = "hover:bg-green-600";
  const accentText = "text-[#22C55E]";

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
    return katOk && mestoOk;
  });

  if (status === "loading") {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><p className="text-gray-600">Nalaganje...</p></div>;
  }
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={() => router.push("/naloge")}
            className="text-sm text-gray-600 hover:text-gray-300 transition-colors duration-150 flex items-center gap-1.5"
          >
            ← Nazaj
          </button>
          <span className="text-white/10">|</span>
          <h1 className="text-2xl font-bold text-white">Odprte naloge</h1>
          <span className="text-xs text-gray-600 bg-white/5 px-2.5 py-1 rounded-full ml-1">{filtered.length}</span>
        </div>

        {isNarocnik && (
          <div className="bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded-xl px-4 py-3 text-sm mb-6">
            Stran je namenjena izvajalcem. Preklopite na <strong>Izvajalec</strong> način za sprejemanje nalog.
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {KATEGORIJE.map((k) => (
              <button
                key={k}
                onClick={() => setFilterKat(k)}
                className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-150 ${
                  filterKat === k
                    ? "bg-[#22C55E] text-white border-[#22C55E]"
                    : "bg-transparent text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-300"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <select
            className="bg-[#111111] border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22C55E] transition-all sm:ml-auto"
            value={filterMesto}
            onChange={(e) => setFilterMesto(e.target.value)}
          >
            {MESTA.map((m) => <option key={m} className="bg-[#111111]">{m}</option>)}
          </select>
        </div>

        {sporocilo && (
          <div className="mb-5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 text-sm">
            {sporocilo}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Nalaganje nalog...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-gray-600">Trenutno ni odprtih nalog v tej kategoriji.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => router.push(`/naloge/${n.id}`)}
                className="bg-[#111111] border border-white/5 rounded-2xl p-5 sm:p-6 flex items-start justify-between hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h2 className="font-semibold text-white">{n.naslov}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 whitespace-nowrap">
                      {n.kategorija}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">{n.opis}</p>
                  <div className="flex gap-3 text-xs text-gray-600 flex-wrap">
                    {n.lokacija && <span>{n.lokacija}</span>}
                    {n.narocnik && <span>· Naročnik: {n.narocnik.ime}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`${accentText} font-bold text-lg`}>{n.cena} €</span>
                  {!isNarocnik && (
                    <button
                      onClick={(e) => { e.stopPropagation(); sprejmi(n.id, n.naslov); }}
                      disabled={sprejemam === n.id}
                      className={`text-sm ${accentBg} ${accentHover} text-white px-4 py-1.5 rounded-xl transition-all duration-150 disabled:opacity-50 whitespace-nowrap hover:shadow-md hover:shadow-green-500/20`}
                    >
                      {sprejemam === n.id ? "Sprejemam..." : "Sprejmi"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
