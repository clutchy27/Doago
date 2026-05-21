"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";

type NalogaOpravljena = {
  id: string;
  naslov: string;
  cena: number;
  kategorija: string;
  lokacija: string;
  status: string;
  createdAt: string;
  narocnik?: { ime: string };
};

type Profil = {
  ime: string;
  email: string;
  vloga: string;
  narocnik: {
    steviloObjavljenih: number;
    steviloOpravljenih: number;
    skupajPorabljeno: number;
  };
  izvajalec: {
    steviloOpravljenih: number;
    skupniZasluzek: number;
    povprecnaOcena: number | null;
    steviloOcen: number;
    steviloAktivnihNalog: number;
  };
};

type SpPodatki = {
  ime: string;
  priimek: string;
  davcnaStevilka: string;
  iban: string;
  naslov: string;
  opis?: string;
  kategorije?: string;
  mesta?: string;
};

type StudentData = {
  opis?: string | null;
  kategorije: string[];
  mesta: string[];
};

const KATEGORIJE_OPTIONS = [
  "Hišna opravila", "Prevoz", "IT pomoč", "Poučevanje",
  "Vrtnarjenje", "Čiščenje", "Dostava", "Montaža",
  "Slikopleskanje", "Drugo",
];

const MESTA_OPTIONS = [
  "Ljubljana", "Maribor", "Celje", "Kranj", "Koper", "Velenje",
  "Novo Mesto", "Ptuj", "Trbovlje", "Kamnik", "Domžale", "Škofja Loka",
  "Nova Gorica", "Slovenj Gradec", "Murska Sobota", "Jesenice",
  "Postojna", "Izola", "Slovenska Bistrica", "Litija", "Ajdovščina",
  "Logatec", "Sežana", "Idrija", "Radovljica", "Vrhnika",
];

function Zvezdice({ ocena, stevilo }: { ocena: number | null; stevilo?: number }) {
  if (ocena === null || ocena === undefined) {
    return <span className="text-gray-600 text-sm">Brez ocen</span>;
  }
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-5 h-5 ${s <= Math.round(ocena) ? "text-orange-400" : "text-gray-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-white font-semibold ml-1">{ocena.toFixed(1)}</span>
      {stevilo !== undefined && stevilo > 0 && (
        <span className="text-gray-600 text-sm">
          ({stevilo} {stevilo === 1 ? "ocena" : stevilo < 5 ? "ocene" : "ocen"})
        </span>
      )}
    </div>
  );
}

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profil, setProfil] = useState<Profil | null>(null);
  const [spPodatki, setSpPodatki] = useState<SpPodatki | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  const [urejanje, setUrejanje] = useState(false);
  const [imeForm, setImeForm] = useState("");
  const [shranjujem, setShranjujem] = useState(false);
  const [napaka, setNapaka] = useState("");

  const [opravljeneNarocnik, setOpravljeneNarocnik] = useState<NalogaOpravljena[]>([]);
  const [opravljeneIzvajalec, setOpravljeneIzvajalec] = useState<NalogaOpravljena[]>([]);

  const [urejanjeSpPodatkov, setUrejanjeSpPodatkov] = useState(false);
  const [spForm, setSpForm] = useState<SpPodatki>({ ime: "", priimek: "", davcnaStevilka: "", iban: "", naslov: "" });
  const [shranjujemSp, setShranjujemSp] = useState(false);
  const [napakaSp, setNapakaSp] = useState("");

  const [urejanjeProfila, setUrejanjeProfila] = useState(false);
  const [profilOpisForm, setProfilOpisForm] = useState("");
  const [profilKategorije, setProfilKategorije] = useState<string[]>([]);
  const [profilMesta, setProfilMesta] = useState<string[]>([]);
  const [shranjujemProfil, setShranjujemProfil] = useState(false);
  const [napakaProfil, setNapakaProfil] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/prijava");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/profil")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setProfil(data);
          setImeForm(data.ime);
          if (data.vloga === "izvajalec") {
            fetch("/api/profil/sp")
              .then((r) => r.json())
              .then((sp) => { if (!sp.error) setSpPodatki(sp); });
          } else {
            fetch("/api/profil/student")
              .then((r) => r.json())
              .then((sd) => {
                if (!sd.error) {
                  setStudentData({ opis: sd.opis, kategorije: sd.kategorije ?? [], mesta: sd.mesta ?? [] });
                }
              });
          }
        }
        setLoading(false);
      });

    fetch("/api/naloge?pogled=narocnik&tab=opravljene")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOpravljeneNarocnik(data); });

    fetch("/api/naloge?pogled=izvajalec&tab=opravljene")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOpravljeneIzvajalec(data); });
  }, [status]);

  const shraniIme = async () => {
    if (!imeForm.trim()) { setNapaka("Ime ne sme biti prazno"); return; }
    setShranjujem(true);
    setNapaka("");
    const res = await fetch("/api/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ime: imeForm }),
    });
    const data = await res.json();
    if (res.ok) {
      setProfil((prev) => prev ? { ...prev, ime: imeForm.trim() } : prev);
      setUrejanje(false);
    } else {
      setNapaka(data.error || "Napaka pri shranjevanju");
    }
    setShranjujem(false);
  };

  const shraniSpPodatke = async () => {
    setNapakaSp("");
    if (!/^\d{8}$/.test(spForm.davcnaStevilka)) {
      setNapakaSp("Davčna številka mora biti točno 8 številk");
      return;
    }
    if (!spForm.iban.startsWith("SI56")) {
      setNapakaSp("IBAN mora začeti s SI56");
      return;
    }
    setShranjujemSp(true);
    const res = await fetch("/api/profil/sp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spForm),
    });
    const data = await res.json();
    if (res.ok) {
      setSpPodatki({ ...spForm });
      setUrejanjeSpPodatkov(false);
    } else {
      setNapakaSp(data.error || "Napaka pri shranjevanju");
    }
    setShranjujemSp(false);
  };

  const openSpEdit = () => {
    setSpForm(spPodatki ?? { ime: "", priimek: "", davcnaStevilka: "", iban: "", naslov: "" });
    setNapakaSp("");
    setUrejanjeSpPodatkov(true);
  };

  const profilInfo = isIzvajalec()
    ? {
        opis: spPodatki?.opis,
        kategorije: spPodatki?.kategorije ? spPodatki.kategorije.split(",").filter(Boolean) : [],
        mesta: spPodatki?.mesta ? spPodatki.mesta.split(",").filter(Boolean) : [],
      }
    : {
        opis: studentData?.opis ?? undefined,
        kategorije: studentData?.kategorije ?? [],
        mesta: studentData?.mesta ?? [],
      };

  function isIzvajalec() { return profil?.vloga === "izvajalec"; }

  const openProfilEdit = () => {
    setProfilOpisForm(profilInfo.opis ?? "");
    setProfilKategorije(profilInfo.kategorije);
    setProfilMesta(profilInfo.mesta);
    setNapakaProfil("");
    setUrejanjeProfila(true);
  };

  const shraniProfil = async () => {
    setShranjujemProfil(true);
    setNapakaProfil("");
    const endpoint = isIzvajalec() ? "/api/profil/sp" : "/api/profil/student";
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opis: profilOpisForm, kategorije: profilKategorije, mesta: profilMesta }),
    });
    const data = await res.json();
    if (res.ok) {
      if (isIzvajalec()) {
        setSpPodatki((prev) => prev ? { ...prev, opis: data.opis, kategorije: data.kategorije, mesta: data.mesta } : prev);
      } else {
        setStudentData({ opis: data.opis, kategorije: data.kategorije ?? [], mesta: data.mesta ?? [] });
      }
      setUrejanjeProfila(false);
    } else {
      setNapakaProfil(data.error || "Napaka pri shranjevanju");
    }
    setShranjujemProfil(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-600">Nalaganje...</p>
      </div>
    );
  }

  if (!session || !profil) return null;

  const spUser = profil.vloga === "izvajalec";
  const isStudent = profil.vloga === "student";
  const isGreen = spUser || isStudent;
  const roleLabel = spUser ? "Izvajalec s.p." : isStudent ? "Izvajalec (študent)" : "Osebni račun";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav current="profil" />

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/naloge")}
            className="text-sm text-gray-600 hover:text-gray-300 transition-colors duration-150 flex items-center gap-1.5"
          >
            ← Nazaj
          </button>
          <span className="text-white/10">|</span>
          <h1 className="text-2xl font-bold text-white">Moj profil</h1>
        </div>

        {/* Profile card */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 sm:p-8 mb-6 hover:border-white/8 transition-all duration-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 border"
                style={
                  isGreen
                    ? { background: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.20)" }
                    : { background: "rgba(249,115,22,0.10)", borderColor: "rgba(249,115,22,0.20)" }
                }
              >
                <span className="text-xl sm:text-2xl font-bold" style={{ color: isGreen ? "#22C55E" : "#F97316" }}>
                  {profil.ime.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{profil.ime}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{profil.email}</p>
                {isGreen && profil.izvajalec.povprecnaOcena !== null && (
                  <div className="mt-1.5">
                    <Zvezdice ocena={profil.izvajalec.povprecnaOcena} stevilo={profil.izvajalec.steviloOcen} />
                  </div>
                )}
              </div>
            </div>
            <span
              className="text-xs px-3 py-1.5 rounded-full font-medium border shrink-0"
              style={
                isGreen
                  ? { background: "rgba(34,197,94,0.10)", color: "#22C55E", borderColor: "rgba(34,197,94,0.20)" }
                  : { background: "rgba(249,115,22,0.10)", color: "#F97316", borderColor: "rgba(249,115,22,0.20)" }
              }
            >
              {roleLabel}
            </span>
          </div>
          <button
            onClick={() => { setImeForm(profil.ime); setNapaka(""); setUrejanje(true); }}
            className="w-full border border-white/10 text-gray-400 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-150"
          >
            Uredi profil
          </button>
        </div>

        {/* ── SEKCIJA A — Kot naročnik (vse vloge) ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">Kot naročnik</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/8 hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1.5">Objavljene</p>
              <p className="text-2xl font-bold text-white">{profil.narocnik.steviloObjavljenih}</p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/8 hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1.5">Zaključene</p>
              <p className="text-2xl font-bold text-white">{profil.narocnik.steviloOpravljenih}</p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/8 hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1.5">Porabljeno</p>
              <p className="text-xl font-bold text-orange-500">{profil.narocnik.skupajPorabljeno.toFixed(0)} €</p>
            </div>
          </div>
          {opravljeneNarocnik.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {opravljeneNarocnik.map((n) => (
                <div key={n.id} className="bg-[#111111] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between hover:border-white/8 transition-all duration-200">
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{n.naslov}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{n.kategorija} · {n.lokacija}</p>
                  </div>
                  <span className="text-orange-500 font-bold text-sm ml-4 shrink-0">{n.cena} €</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SEKCIJA B — Kot izvajalec (vse vloge) ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">Kot izvajalec</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/8 hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1.5">Opravljene</p>
              <p className="text-2xl font-bold text-white">{profil.izvajalec.steviloOpravljenih}</p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/8 hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1.5">Aktivne</p>
              <p className="text-2xl font-bold text-white">{profil.izvajalec.steviloAktivnihNalog}</p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 sm:p-5 col-span-2 hover:border-white/8 hover:-translate-y-0.5 transition-all duration-200">
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-1.5">Skupni zaslužek</p>
              <p className="text-xl font-bold text-green-500">€ {profil.izvajalec.skupniZasluzek.toFixed(2)}</p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 sm:p-5 col-span-2 hover:border-white/8 transition-all duration-200">
              <p className="text-gray-600 text-xs uppercase tracking-wider mb-2.5">Povprečna ocena</p>
              <Zvezdice ocena={profil.izvajalec.povprecnaOcena} stevilo={profil.izvajalec.steviloOcen} />
            </div>
          </div>
          {opravljeneIzvajalec.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {opravljeneIzvajalec.map((n) => (
                <div key={n.id} className="bg-[#111111] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between hover:border-white/8 transition-all duration-200">
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{n.naslov}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{n.kategorija} · {n.lokacija}{n.narocnik ? ` · ${n.narocnik.ime}` : ""}</p>
                  </div>
                  <span className="text-green-500 font-bold text-sm ml-4 shrink-0">{n.cena} €</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SEKCIJA C — Moj profil (opis, kategorije, mesta — vse vloge) ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">Moj profil</span>
            <span className="text-gray-700 text-xs">— vidno naročnikom</span>
          </div>
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-white/8 transition-all duration-200">
            {!urejanjeProfila ? (
              <>
                {spUser && spPodatki && (
                  <p className="text-white font-semibold text-sm mb-3">{spPodatki.ime} {spPodatki.priimek}</p>
                )}
                {profilInfo.opis ? (
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{profilInfo.opis}</p>
                ) : (
                  <p className="text-gray-700 text-sm italic mb-4">Ni opisa storitev</p>
                )}
                {profilInfo.kategorije.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {profilInfo.kategorije.map((k) => (
                      <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">{k}</span>
                    ))}
                  </div>
                )}
                {profilInfo.mesta.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {profilInfo.mesta.map((m) => (
                      <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-[#1a1a1a] text-gray-500 border border-white/8">📍 {m}</span>
                    ))}
                  </div>
                )}
                <button
                  onClick={openProfilEdit}
                  className="w-full border border-green-500/20 text-green-400 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500/5 hover:border-green-500/30 transition-all duration-150"
                >
                  Uredi profil
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                {napakaProfil && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">{napakaProfil}</div>
                )}
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Kratek opis storitev</label>
                  <textarea
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    placeholder="Sem izkušen izvajalec z večletnimi izkušnjami v..."
                    rows={4}
                    value={profilOpisForm}
                    onChange={(e) => setProfilOpisForm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">Kategorije storitev</label>
                  <div className="grid grid-cols-2 gap-2">
                    {KATEGORIJE_OPTIONS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setProfilKategorije((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k])}
                        className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-all duration-150 border ${
                          profilKategorije.includes(k)
                            ? "bg-green-500/15 border-green-500/40 text-green-400"
                            : "bg-[#1a1a1a] border-white/8 text-gray-500 hover:border-white/15 hover:text-gray-300"
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">Mesta kjer delaš</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {MESTA_OPTIONS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setProfilMesta((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])}
                        className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-all duration-150 border ${
                          profilMesta.includes(m)
                            ? "bg-green-500/15 border-green-500/40 text-green-400"
                            : "bg-[#1a1a1a] border-white/8 text-gray-500 hover:border-white/15 hover:text-gray-300"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setUrejanjeProfila(false)}
                    className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-all duration-150 text-sm"
                  >
                    Prekliči
                  </button>
                  <button
                    onClick={shraniProfil}
                    disabled={shranjujemProfil}
                    className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-semibold hover:bg-green-600 transition-all duration-150 disabled:opacity-50 text-sm"
                  >
                    {shranjujemProfil ? "Shranjujem..." : "Shrani"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SEKCIJA D — S.p. podatki (samo izvajalec) ── */}
        {spUser && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">S.p. podatki</span>
              <span className="text-gray-700 text-xs">— za izstavitev računov</span>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 sm:p-6 hover:border-white/8 transition-all duration-200">
              {spPodatki ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Ime</p>
                      <p className="text-white text-sm font-medium">{spPodatki.ime}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Priimek</p>
                      <p className="text-white text-sm font-medium">{spPodatki.priimek}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Davčna številka</p>
                      <p className="text-white text-sm font-mono">{spPodatki.davcnaStevilka}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">IBAN</p>
                      <p className="text-white text-sm font-mono">{spPodatki.iban}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600 text-xs uppercase tracking-wider mb-1">Naslov</p>
                      <p className="text-white text-sm">{spPodatki.naslov}</p>
                    </div>
                  </div>
                  <button
                    onClick={openSpEdit}
                    className="w-full border border-green-500/20 text-green-400 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500/5 hover:border-green-500/30 transition-all duration-150"
                  >
                    Uredi s.p. podatke
                  </button>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-600 text-sm mb-4">Podatki s.p. niso vnešeni</p>
                  <button
                    onClick={openSpEdit}
                    className="border border-green-500/20 text-green-400 px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-500/5 hover:border-green-500/30 transition-all duration-150"
                  >
                    Dodaj podatke
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit ime modal */}
      {urejanje && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-white mb-6">Uredi profil</h2>
            {napaka && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{napaka}</div>
            )}
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Ime</label>
                <input
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all w-full"
                  value={imeForm}
                  onChange={(e) => setImeForm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && shraniIme()}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
                <p className="bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 text-gray-600 text-sm">{profil.email}</p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setUrejanje(false)}
                  className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl font-medium hover:bg-white/5 transition-all duration-150 text-sm"
                >
                  Prekliči
                </button>
                <button
                  onClick={shraniIme}
                  disabled={shranjujem}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 disabled:opacity-50 text-sm"
                >
                  {shranjujem ? "Shranjujem..." : "Shrani"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit s.p. modal */}
      {urejanjeSpPodatkov && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-8 my-8">
            <h2 className="text-xl font-bold text-white mb-6">Uredi s.p. podatke</h2>
            {napakaSp && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{napakaSp}</div>
            )}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Ime</label>
                  <input
                    className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all w-full"
                    placeholder="Ana"
                    value={spForm.ime}
                    onChange={(e) => setSpForm({ ...spForm, ime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Priimek</label>
                  <input
                    className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all w-full"
                    placeholder="Novak"
                    value={spForm.priimek}
                    onChange={(e) => setSpForm({ ...spForm, priimek: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Davčna številka</label>
                <input
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all w-full"
                  placeholder="12345678"
                  maxLength={8}
                  value={spForm.davcnaStevilka}
                  onChange={(e) => setSpForm({ ...spForm, davcnaStevilka: e.target.value.replace(/\D/g, "") })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">IBAN</label>
                <input
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all w-full font-mono"
                  placeholder="SI56 0000 0000 0000 000"
                  value={spForm.iban}
                  onChange={(e) => setSpForm({ ...spForm, iban: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Naslov</label>
                <input
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all w-full"
                  placeholder="Slovenska ulica 1, 1000 Ljubljana"
                  value={spForm.naslov}
                  onChange={(e) => setSpForm({ ...spForm, naslov: e.target.value })}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setUrejanjeSpPodatkov(false)}
                  className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl font-medium hover:bg-white/5 transition-all duration-150 text-sm"
                >
                  Prekliči
                </button>
                <button
                  onClick={shraniSpPodatke}
                  disabled={shranjujemSp}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-150 disabled:opacity-50 text-sm"
                >
                  {shranjujemSp ? "Shranjujem..." : "Shrani"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
