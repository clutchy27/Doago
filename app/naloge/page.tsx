"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
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

type Tab = "sprejete" | "opravljene";
type OcenjevanjeState = { nalogaId: string; naslov: string } | null;

const KATEGORIJE = ["Hišna opravila", "Prevoz", "IT pomoč", "Pouk", "Vrtnarjenje", "Drugo"];
const MESTA = ["Ljubljana", "Maribor", "Celje", "Kranj", "Velenje", "Koper", "Novo mesto", "Ptuj", "Murska Sobota", "Nova Gorica", "Domžale", "Kamnik", "Trbovlje", "Krško", "Postojna", "Slovenj Gradec", "Jesenice", "Škofja Loka", "Brežice", "Izola"];

const statusBarva: Record<string, string> = {
  odprta: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/25",
  sprejeta: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "v teku": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "plačano": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  zaprta: "bg-[#1A1A1A] text-[#525252] border border-[#2A2A2A]",
};

export default function NalogePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { mode } = useMode();

  const [tab, setTab] = useState<Tab>("sprejete");
  const [naloge, setNaloge] = useState<Naloga[]>([]);
  const [loading, setLoading] = useState(true);
  const [obvestila, setObvestila] = useState<{ id: string; prebrano: boolean }[]>([]);

  // Create task modal
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ naslov: "", opis: "", cena: "", kategorija: KATEGORIJE[0], mesto: MESTA[0], ulica: "" });
  const [napaka, setNapaka] = useState("");
  const [posiljam, setPosiljam] = useState(false);

  // Rating modal
  const [ocenjevanje, setOcenjevanje] = useState<OcenjevanjeState>(null);
  const [zvezdice, setZvezdice] = useState(5);
  const [komentar, setKomentar] = useState("");
  const [oddajam, setOddajam] = useState(false);

  // Payment
  const [placam, setPlacam] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/prijava");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/obvestila")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setObvestila(data); });
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch(`/api/naloge?pogled=${mode}&tab=${tab}`)
      .then((r) => r.json())
      .then((data) => { setNaloge(Array.isArray(data) ? data : []); setLoading(false); });
  }, [status, mode, tab]);

  const objavi = async () => {
    if (!form.naslov || !form.opis || !form.cena) { setNapaka("Vsa polja so obvezna"); return; }
    setPosiljam(true);
    setNapaka("");
    const res = await fetch("/api/naloge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naslov: form.naslov,
        opis: form.opis,
        cena: form.cena,
        kategorija: form.kategorija,
        lokacija: form.ulica ? `${form.mesto}, ${form.ulica}` : form.mesto,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setModal(false);
      setForm({ naslov: "", opis: "", cena: "", kategorija: KATEGORIJE[0], mesto: MESTA[0], ulica: "" });
      setLoading(true);
      fetch(`/api/naloge?pogled=${mode}&tab=${tab}`)
        .then((r) => r.json())
        .then((d) => { setNaloge(Array.isArray(d) ? d : []); setLoading(false); });
    } else {
      setNapaka(data.error || "Napaka");
    }
    setPosiljam(false);
  };

  const placaj = async (nalogaId: string) => {
    setPlacam(nalogaId);
    const res = await fetch("/api/placilo/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nalogaId }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Napaka pri ustvarjanju plačila");
      setPlacam(null);
    }
  };

  const oddajOceno = async () => {
    if (!ocenjevanje) return;
    setOddajam(true);
    const res = await fetch("/api/ocene", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nalogaId: ocenjevanje.nalogaId, zvezde: zvezdice, komentar }),
    });
    if (res.ok) {
      setNaloge((prev) => prev.filter((n) => n.id !== ocenjevanje.nalogaId));
      setOcenjevanje(null);
    }
    setOddajam(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <p className="text-[#525252]">Nalaganje...</p>
      </div>
    );
  }
  if (!session) return null;

  const neprebrana = obvestila.filter((o) => !o.prebrano).length;
  const isNarocnik = mode === "narocnik";
  const accentBg = isNarocnik ? "bg-[#F97316]" : "bg-[#22C55E]";
  const accentHover = isNarocnik ? "hover:bg-orange-600" : "hover:bg-green-600";
  const accentShadow = isNarocnik ? "hover:shadow-orange-500/25" : "hover:shadow-green-500/25";
  const accentText = isNarocnik ? "text-[#F97316]" : "text-[#22C55E]";
  const accentGlow = isNarocnik ? "hover:shadow-orange-500/8 hover:border-[#F97316]/20" : "hover:shadow-green-500/8 hover:border-[#22C55E]/20";

  const inputClass = "bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Nav badge={neprebrana > 0 ? neprebrana : undefined} />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isNarocnik ? "Moje naloge" : "Moje naloge (izvajalec)"}
            </h1>
            <p className="text-[#525252] text-sm mt-1">
              {isNarocnik ? "Naloge, ki ste jih objavili" : "Naloge, ki ste jih sprejeli"}
            </p>
          </div>

          {isNarocnik ? (
            <button
              onClick={() => setModal(true)}
              className={`${accentBg} ${accentHover} text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-150 text-sm shadow-lg ${accentShadow} hover:-translate-y-0.5`}
            >
              + Nova naloga
            </button>
          ) : (
            <Link
              href="/naloge/vse"
              className="border border-[#333333] text-[#A3A3A3] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1A1A1A] hover:border-[#444444] hover:text-white transition-all duration-150 hover:-translate-y-0.5"
            >
              Poišči naloge →
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-7 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 w-fit">
          {(["sprejete", "opravljene"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                tab === t
                  ? `${accentBg} text-white shadow-sm`
                  : "text-[#525252] hover:text-[#A3A3A3]"
              }`}
            >
              {t === "sprejete" ? "Sprejete" : "Opravljene"}
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <p className="text-[#525252]">Nalaganje...</p>
        ) : naloge.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-16 text-center">
            <p className="text-[#525252] mb-5 text-sm">
              {tab === "sprejete"
                ? isNarocnik ? "Nimate sprejetih nalog." : "Nimate sprejetih nalog."
                : "Nimate opravljenih nalog."
              }
            </p>
            {tab === "sprejete" && isNarocnik && (
              <button
                onClick={() => setModal(true)}
                className={`${accentBg} ${accentHover} text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-150 text-sm shadow-lg ${accentShadow}`}
              >
                Objavi prvo nalogo
              </button>
            )}
            {tab === "sprejete" && !isNarocnik && (
              <Link
                href="/naloge/vse"
                className="inline-block border border-[#333333] text-[#A3A3A3] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#242424] transition-all"
              >
                Poišči naloge →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {naloge.map((n) => (
              <div
                key={n.id}
                onClick={() => router.push(`/naloge/${n.id}`)}
                className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 sm:p-6 flex items-start justify-between hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 cursor-pointer ${accentGlow}`}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="font-semibold text-white">{n.naslov}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusBarva[n.status] ?? "bg-[#1A1A1A] text-[#525252]"}`}>
                      {n.status}
                    </span>
                  </div>
                  <p className="text-[#A3A3A3] text-sm mb-3 line-clamp-2 leading-relaxed">{n.opis}</p>
                  <div className="flex gap-2 text-xs text-[#525252] flex-wrap items-center">
                    <span className="bg-[#242424] px-2.5 py-1 rounded-full">{n.kategorija}</span>
                    {n.lokacija && <span>📍 {n.lokacija}</span>}
                    {n.narocnik && <span>· {n.narocnik.ime}</span>}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2.5 shrink-0">
                  <span className={`${accentText} font-bold text-xl whitespace-nowrap`}>{n.cena} €</span>

                  {isNarocnik && n.status === "sprejeta" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); placaj(n.id); }}
                      disabled={placam === n.id}
                      className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-xl hover:bg-purple-500/20 transition-all duration-150 whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      {placam === n.id ? "Preusmerjam..." : "Plačaj"}
                    </button>
                  )}

                  {isNarocnik && n.status === "plačano" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setOcenjevanje({ nalogaId: n.id, naslov: n.naslov }); setZvezdice(5); setKomentar(""); }}
                      className="text-xs bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 px-3 py-1.5 rounded-xl hover:bg-[#22C55E]/20 transition-all duration-150 whitespace-nowrap"
                    >
                      ⭐ Oceni izvajalca
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rating modal */}
      {ocenjevanje && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl w-full max-w-md p-8 shadow-2xl shadow-black/60">
            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Oceni izvajalca</h2>
            <p className="text-[#525252] text-sm mb-7">
              Naloga: <span className="text-[#A3A3A3]">{ocenjevanje.naslov}</span>
            </p>
            <div className="mb-6">
              <p className="text-xs text-[#525252] uppercase tracking-wider mb-3 font-semibold">Ocena</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setZvezdice(s)} className="focus:outline-none transition-all duration-150 hover:scale-110 active:scale-95">
                    <svg className={`w-9 h-9 ${s <= zvezdice ? accentText : "text-[#2A2A2A]"} transition-colors duration-150`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-xs text-[#525252] uppercase tracking-wider mb-2 font-semibold">Komentar (neobvezno)</p>
              <textarea
                className={`${inputClass} resize-none w-full`}
                placeholder="Kratko mnenje o izvajalcu..."
                rows={3}
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setOcenjevanje(null)} className="flex-1 border border-[#333333] text-[#A3A3A3] py-3 rounded-xl font-medium hover:bg-[#242424] transition-all duration-150 text-sm">
                Prekliči
              </button>
              <button
                onClick={oddajOceno}
                disabled={oddajam}
                className={`flex-1 ${accentBg} ${accentHover} text-white py-3 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 text-sm shadow-lg ${accentShadow}`}
              >
                {oddajam ? "Oddajam..." : "Oddaj oceno"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create task modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl w-full max-w-md p-8 shadow-2xl shadow-black/60">
            <h2 className="text-xl font-bold text-white mb-7 tracking-tight">Nova naloga</h2>
            {napaka && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">{napaka}</div>
            )}
            <div className="flex flex-col gap-4">
              <input
                className={inputClass}
                placeholder="Naslov naloge"
                value={form.naslov}
                onChange={(e) => setForm({ ...form, naslov: e.target.value })}
              />
              <textarea
                className={`${inputClass} resize-none`}
                placeholder="Opis naloge"
                rows={3}
                value={form.opis}
                onChange={(e) => setForm({ ...form, opis: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Cena (€)"
                type="number"
                min="0"
                value={form.cena}
                onChange={(e) => setForm({ ...form, cena: e.target.value })}
              />
              <select
                className={inputClass}
                value={form.kategorija}
                onChange={(e) => setForm({ ...form, kategorija: e.target.value })}
              >
                {KATEGORIJE.map((k) => <option key={k} className="bg-[#242424]">{k}</option>)}
              </select>
              <select
                className={inputClass}
                value={form.mesto}
                onChange={(e) => setForm({ ...form, mesto: e.target.value })}
              >
                {MESTA.map((m) => <option key={m} className="bg-[#242424]">{m}</option>)}
              </select>
              <input
                className={inputClass}
                placeholder="Ulica (neobvezno)"
                value={form.ulica}
                onChange={(e) => setForm({ ...form, ulica: e.target.value })}
              />
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => { setModal(false); setNapaka(""); }}
                  className="flex-1 border border-[#333333] text-[#A3A3A3] py-3 rounded-xl font-medium hover:bg-[#242424] transition-all duration-150 text-sm"
                >
                  Prekliči
                </button>
                <button
                  onClick={objavi}
                  disabled={posiljam}
                  className={`flex-1 ${accentBg} ${accentHover} text-white py-3 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 text-sm shadow-lg ${accentShadow}`}
                >
                  {posiljam ? "Objavljam..." : "Objavi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
