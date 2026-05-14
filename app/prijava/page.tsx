"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Prijava() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", geslo: "" });
  const [napaka, setNapaka] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setNapaka("");
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      geslo: form.geslo,
    });
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setNapaka("Napačen email ali geslo");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(249,115,22,0.06),transparent)] pointer-events-none" />

      {/* Header */}
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

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 relative">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-[#F97316]/10 border border-[#F97316]/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl">
              👋
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dobrodošli nazaj</h1>
            <p className="text-[#525252] text-sm">Prijavite se v svoj račun</p>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl shadow-black/40">
            {napaka && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
                <span>⚠</span> {napaka}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">Email</label>
                <input
                  className="w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all"
                  placeholder="ime@primer.si"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
              <div>
                <label className="text-xs text-[#525252] font-semibold uppercase tracking-wider mb-2 block">Geslo</label>
                <input
                  className="w-full bg-[#242424] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-[#525252] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  type="password"
                  value={form.geslo}
                  onChange={(e) => setForm({ ...form, geslo: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#F97316] text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-all duration-150 disabled:opacity-50 mt-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5"
              >
                {loading ? "Prijavljam..." : "Prijavi se"}
              </button>
            </div>
          </div>

          <p className="text-center text-[#525252] text-sm mt-7">
            Nimaš računa?{" "}
            <Link href="/register" className="text-[#F97316] hover:text-orange-400 font-semibold transition-colors">
              Registriraj se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
