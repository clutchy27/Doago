"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SpForm = {
  ime: string;
  priimek: string;
  davcnaStevilka: string;
  iban: string;
  naslov: string;
};

export default function Register() {
  const router = useRouter();
  const [vloga, setVloga] = useState<"narocnik" | "izvajalec">("narocnik");
  const [form, setForm] = useState({ ime: "", email: "", geslo: "" });
  const [spForm, setSpForm] = useState<SpForm>({ ime: "", priimek: "", davcnaStevilka: "", iban: "", naslov: "" });
  const [napaka, setNapaka] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (vloga === "izvajalec") {
      if (!spForm.davcnaStevilka.match(/^\d{8}$/)) {
        setNapaka("Davčna številka mora biti točno 8 številk");
        return;
      }
      if (!spForm.iban.startsWith("SI56")) {
        setNapaka("IBAN mora začeti s SI56");
        return;
      }
      if (!spForm.ime.trim() || !spForm.priimek.trim() || !spForm.naslov.trim()) {
        setNapaka("Vsa polja s.p. so obvezna");
        return;
      }
    }
    setLoading(true);
    setNapaka("");
    const body = vloga === "izvajalec"
      ? { ...form, vloga, sp: spForm }
      : { ...form, vloga };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/prijava");
    } else {
      setNapaka(data.error || "Napaka pri registraciji");
      setLoading(false);
    }
  };

  const isIzvajalec = vloga === "izvajalec";
  const accent = isIzvajalec ? "#22C55E" : "#F97316";
  const accentBg = isIzvajalec ? "rgba(34,197,94,0.08)" : "rgba(249,115,22,0.08)";
  const accentBorder = isIzvajalec ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.15)";
  const focusRing = isIzvajalec ? "focus:ring-green-500" : "focus:ring-[#F97316]";

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isIzvajalec
            ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.06), transparent)"
            : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.06), transparent)",
        }}
      />

      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#2A2A2A] relative">
        <Link href="/" className="text-xl font-bold text-[#F97316] hover:text-orange-400 transition-colors duration-150">
          Doago
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-[#525252] hover:text-[#A3A3A3] transition-colors duration-150 font-medium"
        >
          ← Nazaj
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16 relative">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl border"
              style={{ background: accentBg, borderColor: accentBorder }}
            >
              {isIzvajalec ? "🛠️" : "🚀"}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Ustvari račun</h1>
            <p className="text-[#525252] text-sm">Pridruži se Doago skupnosti</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl shadow-black/40">
            {napaka && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
                <span>⚠</span> {napaka}
              </div>
            )}

            {/* Role toggle */}
            <div className="mb-6">
              <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-3 block">
                Registriram se kot:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#111111] rounded-xl p-1 border border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setVloga("narocnik")}
                  className="py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150"
                  style={
                    vloga === "narocnik"
                      ? { background: "rgba(249,115,22,0.15)", color: "#F97316", border: "1px solid rgba(249,115,22,0.3)" }
                      : { color: "#525252", border: "1px solid transparent" }
                  }
                >
                  Naročnik
                </button>
                <button
                  type="button"
                  onClick={() => setVloga("izvajalec")}
                  className="py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150"
                  style={
                    vloga === "izvajalec"
                      ? { background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }
                      : { color: "#525252", border: "1px solid transparent" }
                  }
                >
                  Izvajalec (s.p.)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">Ime in priimek</label>
                <input
                  className={`w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all`}
                  placeholder="Ana Novak"
                  value={form.ime}
                  onChange={(e) => setForm({ ...form, ime: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">Email</label>
                <input
                  className={`w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all`}
                  placeholder="ana@primer.si"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">Geslo</label>
                <input
                  className={`w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  type="password"
                  value={form.geslo}
                  onChange={(e) => setForm({ ...form, geslo: e.target.value })}
                  onKeyDown={(e) => !isIzvajalec && e.key === "Enter" && handleSubmit()}
                />
              </div>

              {/* S.p. fields */}
              {isIzvajalec && (
                <>
                  <div className="border-t border-[#2A2A2A] pt-4 mt-1">
                    <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <span>🛠</span> Podatki s.p.
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">Ime</label>
                          <input
                            className="w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Ana"
                            value={spForm.ime}
                            onChange={(e) => setSpForm({ ...spForm, ime: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">Priimek</label>
                          <input
                            className="w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Novak"
                            value={spForm.priimek}
                            onChange={(e) => setSpForm({ ...spForm, priimek: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">Davčna številka</label>
                        <input
                          className="w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="12345678"
                          maxLength={8}
                          value={spForm.davcnaStevilka}
                          onChange={(e) => setSpForm({ ...spForm, davcnaStevilka: e.target.value.replace(/\D/g, "") })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">IBAN</label>
                        <input
                          className="w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono"
                          placeholder="SI56 0000 0000 0000 000"
                          value={spForm.iban}
                          onChange={(e) => setSpForm({ ...spForm, iban: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">Naslov</label>
                        <input
                          className="w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Slovenska ulica 1, 1000 Ljubljana"
                          value={spForm.naslov}
                          onChange={(e) => setSpForm({ ...spForm, naslov: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!isIzvajalec && (
                <div
                  className="rounded-xl px-4 py-3 text-center"
                  style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
                >
                  <p className="text-orange-400 text-xs font-bold tracking-wide">Naročnik</p>
                  <p className="text-[#525252] text-xs mt-1">Objaviš nalogo, izvajalec jo opravi</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="py-3.5 rounded-xl font-bold transition-all duration-150 disabled:opacity-50 mt-1 shadow-lg hover:-translate-y-0.5 text-white"
                style={{
                  background: isIzvajalec ? "#22C55E" : "#F97316",
                  boxShadow: isIzvajalec ? "0 4px 20px rgba(34,197,94,0.2)" : "0 4px 20px rgba(249,115,22,0.2)",
                }}
              >
                {loading ? "Ustvarjam..." : "Ustvari račun"}
              </button>
            </div>
          </div>

          <p className="text-center text-[#525252] text-sm mt-7">
            Že imaš račun?{" "}
            <Link href="/prijava" className="text-[#F97316] hover:text-orange-400 font-semibold transition-colors">
              Prijavi se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
