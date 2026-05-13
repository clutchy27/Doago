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
  lokacija: string;
  status: string;
  createdAt: string;
  narocnik?: { ime: string };
};

type Obvestilo = {
  id: string;
  besedilo: string;
  prebrano: boolean;
  createdAt: string;
};

type SessionUser = { name?: string; email?: string };
type OcenjevanjeState = { nalogaId: string; naslov: string } | null;
type Pogled = "narocnik" | "izvajalec";

const KATEGORIJE = ["Hišna opravila", "Prevoz", "IT pomoč", "Pouk", "Vrtnarjenje", "Drugo"];
const MESTA = ["Ljubljana", "Maribor", "Celje", "Kranj", "Velenje", "Koper", "Novo mesto", "Ptuj", "Murska Sobota", "Nova Gorica", "Domžale", "Kamnik", "Trbovlje", "Krško", "Postojna", "Slovenj Gradec", "Jesenice", "Škofja Loka", "Brežice", "Izola"];

const statusBarva: Record<string, string> = {
  odprta: "bg-green-500/10 text-green-400 border border-green-500/20",
  sprejeta: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "v teku": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "plačano": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  zaprta: "bg-white/5 text-gray-500 border border-white/10",
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pogled, setPogled] = useState<Pogled>("narocnik");
  const [naloge, setNaloge] = useState<Naloga[]>([]);
  const [loading, setLoading] = useState(true);
  const [obvestila, setObvestila] = useState<Obvestilo[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ naslov: "", opis: "", cena: "", kategorija: KATEGORIJE[0], mesto: MESTA[0], ulica: "" });
  const [napaka, setNapaka] = useState("");
  const [posiljam, setPosiljam] = useState(false);
  const [ocenjevanje, setOcenjevanje] = useState<OcenjevanjeState>(null);
  const [zvezdice, setZvezdice] = useState(5);
  const [komentar, setKomentar] = useState("");
  const [oddajam, setOddajam] = useState(false);
  const [sprejemam, setSprejemam] = useState<string | null>(null);
  const [placam, setPlacam] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/prijava");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      const shranjen = localStorage.getItem("dashboardPogled") as Pogled | null;
      if (shranjen === "izvajalec" || shranjen === "narocnik") setPogled(shranjen);
      fetch("/api/obvestila")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setObvestila(data); });
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch(`/api/naloge?pogled=${pogled}`)
      .then((r) => r.json())
      .then((data) => { setNaloge(Array.isArray(data) ? data : []); setLoading(false); });
  }, [status, pogled]);

  const zamenjajPogled = (novi: Pogled) => {
    setPogled(novi);
    localStorage.setItem("dashboardPogled", novi);
  };

  const oznaci = (naloga: Naloga) => {
    setOcenjevanje({ nalogaId: naloga.id, naslov: naloga.naslov });
    setZvezdice(5);
    setKomentar("");
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
      setNaloge((prev) =>
        prev.map((n) => n.id === ocenjevanje.nalogaId ? { ...n, status: "zaprta" } : n)
      );
      setOcenjevanje(null);
    }
    setOddajam(false);
  };

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
      setNaloge((prev) => [data, ...prev]);
      setModal(false);
      setForm({ naslov: "", opis: "", cena: "", kategorija: KATEGORIJE[0], mesto: MESTA[0], ulica: "" });
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

  const sprejmi = async (id: string, naslov: string) => {
    setSprejemam(id);
    const res = await fetch(`/api/naloge/${id}`, { method: "PATCH" });
    const data = await res.json();
    if (res.ok) {
      setNaloge((prev) => prev.filter((n) => n.id !== id));
    } else {
      alert(data.error || "Napaka pri sprejemu");
    }
    setSprejemam(null);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-600">Nalaganje...</p>
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as SessionUser;
  const neprebrana = obvestila.filter((o) => !o.prebrano).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav current="dashboard" badge={neprebrana > 0 ? neprebrana : undefined} />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        {/* Header z togglem */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {pogled === "narocnik" ? "Moje naloge" : "Odprte naloge"}
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">Pozdravljeni, {user.name}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle */}
            <div className="flex bg-[#111111] border border-white/8 rounded-xl p-1">
              <button
                onClick={() => zamenjajPogled("narocnik")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  pogled === "narocnik"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Naročnik
              </button>
              <button
                onClick={() => zamenjajPogled("izvajalec")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  pogled === "izvajalec"
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Izvajalec
              </button>
            </div>

            {pogled === "narocnik" && (
              <button
                onClick={() => setModal(true)}
                className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 text-sm hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5"
              >
                + Objavi nalogo
              </button>
            )}
          </div>
        </div>

        {/* Narocnik pogled */}
        {pogled === "narocnik" && (
          <>
            {loading ? (
              <p className="text-gray-600">Nalaganje...</p>
            ) : naloge.length === 0 ? (
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-12 text-center">
                <p className="text-gray-600 mb-4">Še nimate objavljenih nalog.</p>
                <button
                  onClick={() => setModal(true)}
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 text-sm"
                >
                  Objavi prvo nalogo
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {naloge.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => router.push(`/naloge/${n.id}`)}
                    className="bg-[#111111] border border-white/5 rounded-2xl p-5 sm:p-6 flex items-start justify-between hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="font-semibold text-white">{n.naslov}</h2>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBarva[n.status] ?? "bg-white/5 text-gray-500"}`}>
                          {n.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{n.opis}</p>
                      <div className="flex gap-2 text-xs text-gray-600 flex-wrap">
                        <span>{n.kategorija}</span>
                        {n.lokacija && <span>· {n.lokacija}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-orange-500 font-bold text-lg whitespace-nowrap">{n.cena} €</span>
                      {n.status === "sprejeta" && (
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
                      {n.status === "plačano" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); oznaci(n); }}
                          className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-xl hover:bg-green-500/20 transition-all duration-150 whitespace-nowrap"
                        >
                          Oceni izvajalca
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Obvestila */}
            {obvestila.length > 0 && (
              <div className="mt-10">
                <h2 className="text-base font-semibold text-white mb-3">Obvestila</h2>
                <div className="flex flex-col gap-2">
                  {obvestila.map((o) => (
                    <div
                      key={o.id}
                      className={`rounded-xl px-4 py-3 text-sm flex items-center gap-3 ${
                        o.prebrano
                          ? "bg-[#111111] border border-white/5 text-gray-600"
                          : "bg-orange-500/10 border border-orange-500/20 text-orange-300"
                      }`}
                    >
                      {!o.prebrano && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                      {o.besedilo}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Izvajalec pogled */}
        {pogled === "izvajalec" && (
          <>
            <p className="text-gray-600 text-sm mb-5">Naloge, ki čakajo na izvajalca</p>

            {loading ? (
              <p className="text-gray-600">Nalaganje...</p>
            ) : naloge.length === 0 ? (
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-12 text-center">
                <p className="text-gray-600">Trenutno ni odprtih nalog.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {naloge.map((n) => (
                  <div
                    key={n.id}
                    className="bg-[#111111] border border-white/5 rounded-2xl p-5 sm:p-6 flex items-start justify-between hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/naloge/${n.id}`)}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="font-semibold text-white">{n.naslov}</h2>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          odprta
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{n.opis}</p>
                      <div className="flex gap-3 text-xs text-gray-600 flex-wrap">
                        <span>{n.kategorija}</span>
                        {n.lokacija && <span>· {n.lokacija}</span>}
                        {n.narocnik && <span>· {n.narocnik.ime}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                      <span className="text-orange-500 font-bold text-lg whitespace-nowrap">{n.cena} €</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); sprejmi(n.id, n.naslov); }}
                        disabled={sprejemam === n.id}
                        className="text-sm bg-blue-500 text-white px-4 py-1.5 rounded-xl hover:bg-blue-600 transition-all duration-150 whitespace-nowrap disabled:opacity-50"
                      >
                        {sprejemam === n.id ? "Sprejemam..." : "Sprejmi"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Rating modal */}
      {ocenjevanje && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-white mb-1">Oceni izvajalca</h2>
            <p className="text-gray-500 text-sm mb-6">
              Naloga: <span className="text-gray-300">{ocenjevanje.naslov}</span>
            </p>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Ocena</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setZvezdice(s)}
                    className="focus:outline-none transition-all duration-150 hover:scale-110 active:scale-95"
                  >
                    <svg
                      className={`w-9 h-9 ${s <= zvezdice ? "text-orange-400" : "text-gray-700"} transition-colors duration-150`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Komentar (neobvezno)</p>
              <textarea
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-all w-full"
                placeholder="Kratko mnenje o izvajalcu..."
                rows={3}
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOcenjevanje(null)}
                className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl font-medium hover:bg-white/5 transition-all duration-150 text-sm"
              >
                Prekliči
              </button>
              <button
                onClick={oddajOceno}
                disabled={oddajam}
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 disabled:opacity-50 text-sm"
              >
                {oddajam ? "Oddajam..." : "Oddaj oceno"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Objavi modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-white mb-6">Objavi nalogo</h2>
            {napaka && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                {napaka}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <input
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Naslov naloge"
                value={form.naslov}
                onChange={(e) => setForm({ ...form, naslov: e.target.value })}
              />
              <textarea
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-all"
                placeholder="Opis naloge"
                rows={3}
                value={form.opis}
                onChange={(e) => setForm({ ...form, opis: e.target.value })}
              />
              <input
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Cena (€)"
                type="number"
                min="0"
                value={form.cena}
                onChange={(e) => setForm({ ...form, cena: e.target.value })}
              />
              <select
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={form.kategorija}
                onChange={(e) => setForm({ ...form, kategorija: e.target.value })}
              >
                {KATEGORIJE.map((k) => <option key={k} className="bg-[#1a1a1a]">{k}</option>)}
              </select>
              <select
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                value={form.mesto}
                onChange={(e) => setForm({ ...form, mesto: e.target.value })}
              >
                {MESTA.map((m) => <option key={m} className="bg-[#1a1a1a]">{m}</option>)}
              </select>
              <input
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Ulica (neobvezno)"
                value={form.ulica}
                onChange={(e) => setForm({ ...form, ulica: e.target.value })}
              />
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => { setModal(false); setNapaka(""); }}
                  className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl font-medium hover:bg-white/5 transition-all duration-150 text-sm"
                >
                  Prekliči
                </button>
                <button
                  onClick={objavi}
                  disabled={posiljam}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 disabled:opacity-50 text-sm"
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
