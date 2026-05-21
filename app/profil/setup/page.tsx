"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const KATEGORIJE = [
  "Hišna opravila", "Prevoz", "IT pomoč", "Poučevanje",
  "Vrtnarjenje", "Čiščenje", "Dostava", "Montaža",
  "Slikopleskanje", "Drugo",
];

const MESTA = [
  "Ljubljana", "Maribor", "Celje", "Kranj", "Koper", "Velenje",
  "Novo Mesto", "Ptuj", "Trbovlje", "Kamnik", "Domžale", "Škofja Loka",
  "Nova Gorica", "Slovenj Gradec", "Murska Sobota", "Jesenice",
  "Postojna", "Izola", "Slovenska Bistrica", "Litija", "Ajdovščina",
  "Logatec", "Sežana", "Idrija", "Radovljica", "Vrhnika",
];

export default function ProfilSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [opis, setOpis] = useState("");
  const [kategorije, setKategorije] = useState<string[]>([]);
  const [mesta, setMesta] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/prijava");
    if (status === "authenticated") {
      const vloga = (session?.user as any)?.vloga;
      if (vloga !== "izvajalec" && vloga !== "student") router.replace("/naloge");
    }
  }, [status, session, router]);

  const toggleKategorija = (k: string) =>
    setKategorije((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]);

  const toggleMesto = (m: string) =>
    setMesta((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const submit = async (skip = false) => {
    setSubmitting(true);
    await fetch("/api/profil/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skip ? { opis: "", kategorije: [], mesta: [] } : { opis, kategorije, mesta }),
    });
    router.push("/naloge");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-600">Nalaganje...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(34,197,94,0.06),transparent)] pointer-events-none" />

      {/* Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#2A2A2A] relative">
        <span className="text-xl font-bold text-green-500">Doago</span>
        <button
          onClick={() => submit(true)}
          disabled={submitting}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors duration-150"
        >
          Preskoči za zdaj
        </button>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-10 relative">
        <div className="w-full max-w-lg">

          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  step >= 1
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : "bg-white/5 border-white/10 text-gray-600"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`text-xs font-medium transition-colors ${step >= 1 ? "text-green-400" : "text-gray-600"}`}>
                Storitve
              </span>
            </div>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  step >= 2
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : "bg-white/5 border-white/10 text-gray-600"
                }`}
              >
                2
              </div>
              <span className={`text-xs font-medium transition-colors ${step >= 2 ? "text-green-400" : "text-gray-600"}`}>
                Pregled
              </span>
            </div>
          </div>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Opiši svoje storitve</h1>
              <p className="text-gray-600 text-sm mb-8">Pomagaj naročnikom razumeti, kaj ponujaš</p>

              <div className="flex flex-col gap-7">
                {/* Opis */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2 block">
                    Kratek opis
                  </label>
                  <textarea
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                    placeholder="Sem izkušen izvajalec z večletnimi izkušnjami v..."
                    rows={4}
                    value={opis}
                    onChange={(e) => setOpis(e.target.value)}
                  />
                </div>

                {/* Kategorije */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 block">
                    Kategorije, ki jih opravljaš
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {KATEGORIJE.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => toggleKategorija(k)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150 border ${
                          kategorije.includes(k)
                            ? "bg-green-500/15 border-green-500/40 text-green-400"
                            : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-500 hover:border-[#333333] hover:text-gray-300"
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mesta */}
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 block">
                    Mesta kjer delaš
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                    {MESTA.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMesto(m)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-all duration-150 border ${
                          mesta.includes(m)
                            ? "bg-green-500/15 border-green-500/40 text-green-400"
                            : "bg-[#1A1A1A] border-[#2A2A2A] text-gray-500 hover:border-[#333333] hover:text-gray-300"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold hover:bg-green-600 transition-all duration-150 shadow-lg shadow-green-500/20 hover:-translate-y-0.5"
                >
                  Naprej →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Pregled in potrdi</h1>
              <p className="text-gray-600 text-sm mb-8">Preveri podatke pred objavo profila</p>

              <div className="flex flex-col gap-4 mb-8">
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">Opis</p>
                  {opis ? (
                    <p className="text-gray-300 text-sm leading-relaxed">{opis}</p>
                  ) : (
                    <p className="text-gray-700 text-sm italic">Ni opisa</p>
                  )}
                </div>

                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Kategorije</p>
                  {kategorije.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {kategorije.map((k) => (
                        <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          {k}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm italic">Ni izbranih kategorij</p>
                  )}
                </div>

                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Območje dela</p>
                  {mesta.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {mesta.map((m) => (
                        <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-[#2A2A2A] text-gray-400 border border-[#333333]">
                          {m}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm italic">Ni izbranih mest</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-[#2A2A2A] text-gray-400 py-3.5 rounded-xl font-medium hover:bg-white/5 transition-all duration-150"
                >
                  ← Nazaj
                </button>
                <button
                  onClick={() => submit(false)}
                  disabled={submitting}
                  className="flex-1 bg-green-500 text-white py-3.5 rounded-xl font-bold hover:bg-green-600 transition-all duration-150 shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                  {submitting ? "Shranjujem..." : "Potrdi in začni"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center mt-8">
            <button
              onClick={() => submit(true)}
              disabled={submitting}
              className="text-gray-700 text-sm hover:text-gray-500 transition-colors duration-150"
            >
              Preskoči za zdaj — dokončaj pozneje iz profila
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
