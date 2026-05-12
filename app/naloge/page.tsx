"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";

type Naloga = {
  id: string;
  naslov: string;
  opis: string;
  cena: number;
  kategorija: string;
  status: string;
  createdAt: string;
  narocnik?: { ime: string };
};

type SessionUser = { name?: string };

const KATEGORIJE = ["Vse", "Hišna opravila", "Prevoz", "IT pomoč", "Pouk", "Vrtnarjenje", "Drugo"];

export default function NalogePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [naloge, setNaloge] = useState<Naloga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Vse");
  const [sprejemam, setSprejemam] = useState<string | null>(null);
  const [sporocilo, setSporocilo] = useState<string | null>(null);

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

  const filtered = filter === "Vse" ? naloge : naloge.filter((n) => n.kategorija === filter);

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
      <Nav current="naloge" />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-gray-600 hover:text-gray-300 transition-colors duration-150 flex items-center gap-1.5"
          >
            ← Nazaj
          </button>
          <span className="text-white/10">|</span>
          <h1 className="text-2xl font-bold text-white">Odprte naloge</h1>
          <span className="text-xs text-gray-600 bg-white/5 px-2.5 py-1 rounded-full ml-1">{filtered.length}</span>
        </div>

        {/* Kategorije filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {KATEGORIJE.map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-150 ${
                filter === k
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-transparent text-gray-500 border-white/10 hover:border-white/20 hover:text-gray-300"
              }`}
            >
              {k}
            </button>
          ))}
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
                className="bg-[#111111] border border-white/5 rounded-2xl p-5 sm:p-6 flex items-start justify-between hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h2 className="font-semibold text-white">{n.naslov}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 whitespace-nowrap">
                      {n.kategorija}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">{n.opis}</p>
                  {n.narocnik && (
                    <span className="text-xs text-gray-600">Naročnik: {n.narocnik.ime}</span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-orange-500 font-bold text-lg">{n.cena} €</span>
                  <button
                    onClick={() => sprejmi(n.id, n.naslov)}
                    disabled={sprejemam === n.id}
                    className="text-sm bg-orange-500 text-white px-4 py-1.5 rounded-xl hover:bg-orange-600 transition-all duration-150 disabled:opacity-50 whitespace-nowrap hover:shadow-md hover:shadow-orange-500/20"
                  >
                    {sprejemam === n.id ? "Sprejemam..." : "Sprejmi"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
