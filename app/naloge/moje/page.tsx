"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { useMode } from "@/context/ModeContext";
import IzvajalecApprovalModal, { type ApprovalTask } from "@/components/IzvajalecApprovalModal";

type Naloga = {
  id: string;
  naslov: string;
  opis: string;
  cena: number;
  kategorija: string;
  lokacija: string;
  status: string;
  nujna: boolean;
  profesionalna: boolean;
  createdAt: string;
  narocnik?: { ime: string };
};

type Tab = "objavljene" | "sprejete" | "opravljene";
type ZakljucevanjeTask = { nalogaId: string; naslov: string; cena: number } | null;

const KATEGORIJE = ["Hišna opravila", "Prevoz", "IT pomoč", "Pouk", "Vrtnarjenje", "Drugo"];
const MESTA = ["Ljubljana", "Maribor", "Celje", "Kranj", "Velenje", "Koper", "Novo mesto", "Ptuj", "Murska Sobota", "Nova Gorica", "Domžale", "Kamnik", "Trbovlje", "Krško", "Postojna", "Slovenj Gradec", "Jesenice", "Škofja Loka", "Brežice", "Izola"];

const statusBarva: Record<string, string> = {
  odprta: "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/25",
  caka_potrditev: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  sprejeta: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "plačano": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  caka_zakljucek: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  reklamacija: "bg-red-500/10 text-red-400 border border-red-500/20",
  zaprta: "bg-[#1A1A1A] text-[#525252] border border-[#2A2A2A]",
};

export default function MojeNalogePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { mode } = useMode();

  const [tab, setTab] = useState<Tab>("objavljene");
  const [naloge, setNaloge] = useState<Naloga[]>([]);
  const [loading, setLoading] = useState(true);
  const [obvestila, setObvestila] = useState<{ id: string; prebrano: boolean }[]>([]);

  // Create task modal
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ naslov: "", opis: "", cena: "", kategorija: KATEGORIJE[0], mesto: MESTA[0], ulica: "", nujna: false, profesionalna: false });
  const [napaka, setNapaka] = useState("");
  const [posiljam, setPosiljam] = useState(false);

  // Payment
  const [placam, setPlacam] = useState<string | null>(null);

  // Izvajalec approval modal (narocnik sees this when izvajalec applies)
  const [approvalTask, setApprovalTask] = useState<ApprovalTask | null>(null);

  // Izvajalec: "Označi kot opravljeno"
  const [oznacujem, setOznacujem] = useState<string | null>(null);

  // Narocnik blocking modal: nalogo treba potrditi in oceniti (caka_zakljucek)
  const [zakljucevanjeTask, setZakljucevanjeTask] = useState<ZakljucevanjeTask>(null);
  const [zvezdiceZakljucek, setZvezdiceZakljucek] = useState(0);
  const [komentarZakljucek, setKomentarZakljucek] = useState("");
  const [oddajamZakljucek, setOddajamZakljucek] = useState(false);
  const [napakaModa, setNapakaModa] = useState("");

  // Reklamacija step inside blocking modal
  const [reklamacijaKorak, setReklamacijaKorak] = useState(false);
  const [reklamacijaRazlog, setReklamacijaRazlog] = useState("");
  const [oddajamReklamacijo, setOddajamReklamacijo] = useState(false);
  const [napakaReklamacija, setNapakaReklamacija] = useState("");

  // Success toast
  const [sporocilo, setSporocilo] = useState<string | null>(null);

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
    setTab(mode === "narocnik" ? "objavljene" : "sprejete");
  }, [mode]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch(`/api/naloge?pogled=${mode}&tab=${tab}`)
      .then((r) => r.json())
      .then((data) => { setNaloge(Array.isArray(data) ? data : []); setLoading(false); });
  }, [status, mode, tab]);

  // Poll for pending izvajalec approvals (narocnik only)
  useEffect(() => {
    if (status !== "authenticated" || mode !== "narocnik") return;
    let cancelled = false;
    const poll = () => {
      fetch("/api/naloge?pogled=narocnik&tab=caka_potrditev")
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data) && data.length > 0) {
            setApprovalTask((prev) => {
              if (prev) return prev;
              const first = data[0];
              return {
                nalogaId: first.id,
                naslovNaloge: first.naslov,
                izvajalecIme: first.izvajalecIme ?? "Izvajalec",
                izvajalecVloga: first.izvajalecVloga ?? "",
                izvajalecOpis: first.izvajalecOpis ?? null,
                izvajalecKategorije: first.izvajalecKategorije ?? null,
                izvajalecMesta: first.izvajalecMesta ?? null,
                izvajalecPovprecnaOcena: first.izvajalecPovprecnaOcena ?? null,
                izvajalecSteviloOpravljenih: parseInt(first.izvajalecSteviloOpravljenih) || 0,
              };
            });
          } else {
            setApprovalTask(null);
          }
        })
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [status, mode]);

  // Poll for caka_zakljucek tasks (narocnik only) — blocking rating modal
  useEffect(() => {
    if (status !== "authenticated" || mode !== "narocnik") return;
    let cancelled = false;
    const poll = () => {
      fetch("/api/naloge?pogled=narocnik&tab=sprejete")
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data)) {
            const caka = data.find((n: Naloga) => n.status === "caka_zakljucek");
            setZakljucevanjeTask((prev) => {
              if (caka && !prev) {
                setZvezdiceZakljucek(0);
                setKomentarZakljucek("");
                setNapakaModa("");
                return { nalogaId: caka.id, naslov: caka.naslov, cena: caka.cena };
              }
              if (!caka) return null;
              return prev;
            });
          }
        })
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [status, mode]);

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
        nujna: form.nujna,
        profesionalna: form.profesionalna,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setModal(false);
      setForm({ naslov: "", opis: "", cena: "", kategorija: KATEGORIJE[0], mesto: MESTA[0], ulica: "", nujna: false, profesionalna: false });
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

  const oznaci = async (nalogaId: string) => {
    setOznacujem(nalogaId);
    const res = await fetch(`/api/naloge/${nalogaId}/opravljeno`, { method: "PATCH" });
    if (res.ok) {
      setNaloge((prev) => prev.map((n) => n.id === nalogaId ? { ...n, status: "caka_zakljucek" } : n));
    }
    setOznacujem(null);
  };

  const oddajZakljucek = async () => {
    if (!zakljucevanjeTask || zvezdiceZakljucek < 1) return;
    setOddajamZakljucek(true);
    setNapakaModa("");
    const res = await fetch(`/api/naloge/${zakljucevanjeTask.nalogaId}/zakljuci`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zvezdice: zvezdiceZakljucek, komentar: komentarZakljucek }),
    });
    if (res.ok) {
      const naslovNaloge = zakljucevanjeTask.naslov;
      setZakljucevanjeTask(null);
      setSporocilo(`Ocena oddana! Naloga "${naslovNaloge}" je uspešno zaprta.`);
      setTimeout(() => setSporocilo(null), 6000);
      setLoading(true);
      fetch(`/api/naloge?pogled=${mode}&tab=${tab}`)
        .then((r) => r.json())
        .then((data) => { setNaloge(Array.isArray(data) ? data : []); setLoading(false); });
    } else {
      const data = await res.json();
      setNapakaModa(data.error || "Napaka pri zaključku");
    }
    setOddajamZakljucek(false);
  };

  const oddajReklamacijo = async () => {
    if (!zakljucevanjeTask) return;
    if (reklamacijaRazlog.trim().length < 20) {
      setNapakaReklamacija("Razlog mora vsebovati vsaj 20 znakov");
      return;
    }
    setOddajamReklamacijo(true);
    setNapakaReklamacija("");
    const res = await fetch(`/api/naloge/${zakljucevanjeTask.nalogaId}/reklamacija`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ razlog: reklamacijaRazlog }),
    });
    if (res.ok) {
      const naslovNaloge = zakljucevanjeTask.naslov;
      setZakljucevanjeTask(null);
      setReklamacijaKorak(false);
      setReklamacijaRazlog("");
      setSporocilo(`Reklamacija za nalogo "${naslovNaloge}" je bila uspešno vložena.`);
      setTimeout(() => setSporocilo(null), 6000);
      setLoading(true);
      fetch(`/api/naloge?pogled=${mode}&tab=${tab}`)
        .then((r) => r.json())
        .then((data) => { setNaloge(Array.isArray(data) ? data : []); setLoading(false); });
    } else {
      const data = await res.json();
      setNapakaReklamacija(data.error || "Napaka pri vložitvi reklamacije");
    }
    setOddajamReklamacijo(false);
  };

  const handleApprovalDone = () => {
    setApprovalTask(null);
    setLoading(true);
    fetch(`/api/naloge?pogled=${mode}&tab=${tab}`)
      .then((r) => r.json())
      .then((data) => { setNaloge(Array.isArray(data) ? data : []); setLoading(false); });
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
      <Nav badge={neprebrana > 0 ? neprebrana : undefined} current="moje" />

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
          {(isNarocnik ? (["objavljene", "sprejete"] as Tab[]) : (["sprejete", "opravljene"] as Tab[])).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                tab === t
                  ? `${accentBg} text-white shadow-sm`
                  : "text-[#525252] hover:text-[#A3A3A3]"
              }`}
            >
              {t === "objavljene" ? "Objavljene" : t === "sprejete" ? (isNarocnik ? "Sprejete" : "Neopravljene") : "Opravljene"}
            </button>
          ))}
        </div>

        {/* Success toast */}
        {sporocilo && (
          <div className="mb-5 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {sporocilo}
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <p className="text-[#525252]">Nalaganje...</p>
        ) : naloge.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-16 text-center">
            <p className="text-[#525252] mb-5 text-sm">
              {tab === "objavljene"
                ? "Nimate objavljenih nalog."
                : tab === "sprejete"
                ? isNarocnik ? "Nimate sprejetih nalog." : "Nimate neopravljenih nalog."
                : "Nimate opravljenih nalog."
              }
            </p>
            {(tab === "objavljene" || tab === "sprejete") && isNarocnik && (
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
                className={`bg-[#1A1A1A] rounded-2xl p-5 sm:p-6 flex items-start justify-between hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 cursor-pointer ${accentGlow} ${n.nujna ? "border border-red-500/30 shadow-[0_0_16px_rgba(239,68,68,0.08)]" : "border border-[#2A2A2A]"}`}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {n.nujna && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-wide">
                        🔴 Nujno
                      </span>
                    )}
                    {n.profesionalna && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
                        ⭐ PRO
                      </span>
                    )}
                    <h2 className="font-semibold text-white">{n.naslov}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusBarva[n.status] ?? "bg-[#1A1A1A] text-[#525252]"}`}>
                      {n.status === "caka_zakljucek" ? "čaka zaključek" : n.status === "reklamacija" ? "V reklamaciji" : n.status}
                    </span>
                  </div>
                  <p className="text-[#A3A3A3] text-sm mb-3 line-clamp-2 leading-relaxed">{n.opis}</p>
                  {!isNarocnik && n.status === "caka_potrditev" && (
                    <p className="text-amber-400 text-xs mb-2">⏳ Čakaš na potrditev naročnika...</p>
                  )}
                  {!isNarocnik && n.status === "caka_zakljucek" && (
                    <p className="text-teal-400 text-xs mb-2">⏳ Čakaš na potrditev naročnika...</p>
                  )}
                  <div className="flex gap-2 text-xs text-[#525252] flex-wrap items-center">
                    <span className="bg-[#242424] px-2.5 py-1 rounded-full">{n.kategorija}</span>
                    {n.lokacija && <span>📍 {n.lokacija}</span>}
                    {n.narocnik && <span>· {n.narocnik.ime}</span>}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2.5 shrink-0">
                  <span className={`${accentText} font-bold text-xl whitespace-nowrap`}>{n.cena} €</span>

                  {isNarocnik && n.status === "caka_potrditev" && (
                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
                      ⏳ Čaka potrditev
                    </span>
                  )}

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
                    <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
                      ⏳ Čaka izvajalca
                    </span>
                  )}

                  {isNarocnik && n.status === "caka_zakljucek" && (
                    <span className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
                      ✓ Opravljeno
                    </span>
                  )}

                  {!isNarocnik && n.status === "plačano" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); oznaci(n.id); }}
                      disabled={oznacujem === n.id}
                      className="text-xs bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 px-3 py-1.5 rounded-xl hover:bg-[#22C55E]/20 transition-all duration-150 whitespace-nowrap disabled:opacity-50 font-semibold"
                    >
                      {oznacujem === n.id ? "Označujem..." : "Označi kot opravljeno"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Izvajalec approval modal */}
      {approvalTask && (
        <IzvajalecApprovalModal
          naloga={approvalTask}
          isNarocnik={isNarocnik}
          onZakljuceno={handleApprovalDone}
        />
      )}

      {/* Blocking narocnik modal — potrdi in oceni (caka_zakljucek) */}
      {zakljucevanjeTask && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] px-4 backdrop-blur-md" aria-modal="true" role="dialog">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-lg shadow-2xl shadow-black/80 overflow-y-auto max-h-[90vh]">

            {/* Top accent bar */}
            <div className={`h-1 w-full rounded-t-2xl ${reklamacijaKorak ? "bg-gradient-to-r from-red-600 to-red-500" : "bg-gradient-to-r from-orange-500 to-orange-400"}`} />

            <div className="p-8 sm:p-10">
              {reklamacijaKorak ? (
                <>
                  {/* Reklamacija confirmation step */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <span className="text-3xl" role="img" aria-label="Reklamacija">⚠️</span>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold mb-3">
                      Reklamacija
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                      Ste prepričani?
                    </h2>
                    <p className="text-[#A3A3A3] text-sm leading-relaxed">
                      S tem sporočite da izvajalec ni opravil naloge.
                    </p>
                  </div>

                  <div className="h-px bg-[#1E1E1E] mb-6" />

                  {napakaReklamacija && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                      {napakaReklamacija}
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-xs text-[#525252] uppercase tracking-wider mb-2 font-semibold">
                      Opišite kaj je šlo narobe <span className="text-red-400">— obvezno</span>
                    </p>
                    <textarea
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/30 transition-all resize-none"
                      placeholder="Opišite kaj je šlo narobe (vsaj 20 znakov)"
                      rows={4}
                      value={reklamacijaRazlog}
                      onChange={(e) => { setReklamacijaRazlog(e.target.value); setNapakaReklamacija(""); }}
                    />
                    <p className={`text-xs mt-1.5 text-right ${reklamacijaRazlog.trim().length >= 20 ? "text-[#525252]" : "text-red-500/60"}`}>
                      {reklamacijaRazlog.trim().length}/20 znakov min.
                    </p>
                  </div>

                  <button
                    onClick={oddajReklamacijo}
                    disabled={oddajamReklamacijo || reklamacijaRazlog.trim().length < 20}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold tracking-wide transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-base shadow-lg shadow-red-500/20 hover:-translate-y-0.5 active:translate-y-0 mb-3"
                  >
                    {oddajamReklamacijo ? "Vlagam reklamacijo..." : "Potrdi reklamacijo"}
                  </button>

                  <button
                    onClick={() => { setReklamacijaKorak(false); setReklamacijaRazlog(""); setNapakaReklamacija(""); }}
                    className="w-full border border-[#2A2A2A] text-[#A3A3A3] py-3 rounded-xl font-medium hover:bg-[#1A1A1A] hover:text-white transition-all duration-150 text-sm"
                  >
                    Nazaj
                  </button>
                </>
              ) : (
                <>
                  {/* Normal rating step */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <span className="text-3xl" role="img" aria-label="Opravljeno">✅</span>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold mb-3">
                      Naloga opravljena
                    </span>
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                      Potrdi in oceni izvajalca
                    </h2>
                    <p className="text-[#F97316] font-semibold text-base leading-snug">
                      {zakljucevanjeTask.naslov}
                    </p>
                    <p className="text-[#525252] text-sm mt-3 leading-relaxed">
                      Izvajalec je zaključil nalogo. Izberite oceno in potrdite — brez tega nalogo ne morete zapreti.
                    </p>
                  </div>

                  <div className="h-px bg-[#1E1E1E] mb-7" />

                  {napakaModa && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
                      {napakaModa}
                    </div>
                  )}

                  {/* Stars */}
                  <div className="mb-7">
                    <p className="text-xs text-[#525252] uppercase tracking-wider mb-4 font-semibold text-center">
                      Ocena izvajalca
                      {zvezdiceZakljucek === 0 && <span className="text-orange-500 ml-1">— obvezno</span>}
                    </p>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setZvezdiceZakljucek(s)}
                          className="focus:outline-none transition-all duration-150 hover:scale-125 active:scale-95 group"
                        >
                          <svg
                            className={`w-10 h-10 transition-colors duration-150 ${
                              s <= zvezdiceZakljucek
                                ? "text-[#F97316] drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]"
                                : "text-[#2E2E2E] group-hover:text-[#F97316]/40"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    {zvezdiceZakljucek > 0 && (
                      <p className="text-center text-[#F97316] text-sm font-semibold mt-3">
                        {["", "Slabo", "Zadostno", "Dobro", "Zelo dobro", "Odlično"][zvezdiceZakljucek]} · {zvezdiceZakljucek}/5
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div className="mb-7">
                    <p className="text-xs text-[#525252] uppercase tracking-wider mb-2 font-semibold">Komentar</p>
                    <textarea
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 focus:border-[#F97316]/30 transition-all resize-none"
                      placeholder="Kako je bilo? (neobvezno)"
                      rows={3}
                      value={komentarZakljucek}
                      onChange={(e) => setKomentarZakljucek(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={oddajZakljucek}
                    disabled={oddajamZakljucek || zvezdiceZakljucek < 1}
                    className="w-full bg-[#F97316] hover:bg-orange-600 text-white py-4 rounded-xl font-bold tracking-wide transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed text-base shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 mb-4"
                  >
                    {oddajamZakljucek ? "Potrjujem..." : zvezdiceZakljucek < 1 ? "Najprej izberite oceno" : "Potrdi in oceni izvajalca"}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => { setReklamacijaKorak(true); setNapakaModa(""); }}
                      className="text-sm text-red-400/70 hover:text-red-400 transition-colors duration-150 underline underline-offset-2"
                    >
                      Naloga ni bila opravljena
                    </button>
                  </div>
                </>
              )}
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

              <button
                type="button"
                onClick={() => setForm({ ...form, nujna: !form.nujna })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                  form.nujna
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-[#242424] border-[#333333] text-[#525252] hover:border-[#444444] hover:text-[#A3A3A3]"
                }`}
              >
                <span className="text-base">🔴</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Nujna naloga — potrebujem danes</p>
                  {form.nujna && (
                    <p className="text-xs mt-0.5 text-red-400/70">Izvajalci bodo obveščeni, da je naloga nujna</p>
                  )}
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors duration-150 flex items-center px-0.5 shrink-0 ${form.nujna ? "bg-red-500" : "bg-[#333333]"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-150 ${form.nujna ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, profesionalna: !form.profesionalna })}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                  form.profesionalna
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    : "bg-[#242424] border-[#333333] text-[#525252] hover:border-[#444444] hover:text-[#A3A3A3]"
                }`}
              >
                <span className="text-base">⭐</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Profesionalna naloga</p>
                  {form.profesionalna && (
                    <p className="text-xs mt-0.5 text-blue-400/70">Naloga zahteva strokovno znanje ali izkušnje</p>
                  )}
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors duration-150 flex items-center px-0.5 shrink-0 ${form.profesionalna ? "bg-blue-500" : "bg-[#333333]"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-150 ${form.profesionalna ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </button>

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
