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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors duration-150">
          Doago
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors duration-150"
        >
          ← Nazaj
        </Link>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Dobrodošli nazaj</h1>
            <p className="text-gray-500 text-sm">Prijavite se v svoj račun</p>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-2xl p-8">
            {napaka && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                {napaka}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <input
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <input
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Geslo"
                type="password"
                value={form.geslo}
                onChange={(e) => setForm({ ...form, geslo: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 disabled:opacity-50 mt-1 hover:shadow-lg hover:shadow-orange-500/20"
              >
                {loading ? "Prijavljam..." : "Prijavi se"}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Nimaš računa?{" "}
            <Link href="/register" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
              Registriraj se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
