"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ ime: "", email: "", geslo: "" });
  const [napaka, setNapaka] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setNapaka("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/prijava");
    } else {
      setNapaka(data.error || "Napaka pri registraciji");
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
            <h1 className="text-2xl font-bold text-white mb-1">Ustvari račun</h1>
            <p className="text-gray-500 text-sm">Pridruži se Doago skupnosti</p>
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
                placeholder="Ime in priimek"
                value={form.ime}
                onChange={(e) => setForm({ ...form, ime: e.target.value })}
              />
              <input
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Geslo"
                type="password"
                value={form.geslo}
                onChange={(e) => setForm({ ...form, geslo: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />

              <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-3 text-center">
                <p className="text-orange-400 text-xs font-medium">Naročnik & Izvajalec</p>
                <p className="text-gray-600 text-xs mt-0.5">Objavljaš in sprejemaš naloge</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 disabled:opacity-50 mt-1 hover:shadow-lg hover:shadow-orange-500/20"
              >
                {loading ? "Ustvarjam..." : "Ustvari račun"}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Že imaš račun?{" "}
            <Link href="/prijava" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
              Prijavi se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
