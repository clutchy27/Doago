"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Nav } from "@/components/Nav";

const STATS = [
  { value: "100+", label: "Objavljenih nalog", icon: "📋" },
  { value: "50+", label: "Aktivnih izvajalcev", icon: "👷" },
  { value: "4.8★", label: "Povprečna ocena", icon: "⭐" },
  { value: "24h", label: "Povprečen odzivni čas", icon: "⚡" },
];

const KORAKI = [
  {
    st: "01",
    naslov: "Objavi nalogo",
    opis: "Opiši kar potrebuješ, nastavi ceno in kategorijo. Naša AI ti pomaga oceniti primerno vrednost.",
    icon: "✏️",
  },
  {
    st: "02",
    naslov: "Izvajalec sprejme",
    opis: "Usposobljeni izvajalci vidijo tvojo nalogo in jo sprejmejo. Takoj prejmeš obvestilo.",
    icon: "🤝",
  },
  {
    st: "03",
    naslov: "Oceni in zaključi",
    opis: "Ko je naloga opravljena, jo označi kot zaključeno in oceni izvajalca z 1–5 zvezdicami.",
    icon: "🏆",
  },
];

const KATEGORIJE = ["Hišna opravila", "Prevoz", "IT pomoč", "Pouk", "Vrtnarjenje", "Dostava", "Čiščenje", "Montaža"];

export default function Home() {
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">

      {/* Nav */}
      {loggedIn ? (
        <Nav />
      ) : (
        <nav className="sticky top-0 z-40 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#2A2A2A]">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 grid grid-cols-3 items-center">
            <Link href="/" className="text-xl font-bold text-[#F97316] hover:text-orange-400 transition-colors duration-150">
              Doago
            </Link>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Link
                href="/prijava"
                className="text-sm text-[#A3A3A3] hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all duration-150 font-medium"
              >
                Prijavi se
              </Link>
              <Link
                href="/register"
                className="text-sm bg-[#F97316] text-white px-5 py-2 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
              >
                Registriraj se
              </Link>
            </div>
            <div />
          </div>
        </nav>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(249,115,22,0.10),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_70%_60%,rgba(34,197,94,0.04),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-24 sm:pt-36 pb-20 sm:pb-32 text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#F97316]/10 border border-[#F97316]/20 text-orange-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide">
            🇸🇮 Slovenska platforma za storitve
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-7">
            Potrebuješ pomoč?
            <br />
            <span className="text-[#F97316]">Doago.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#A3A3A3] max-w-lg mx-auto leading-relaxed mb-12">
            Poveži se z zaupanja vrednimi izvajalci za hišna opravila, prevoz, IT pomoč in še več. Hitro, preprosto, pošteno.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={loggedIn ? "/naloge" : "/register"}
              className="bg-[#F97316] text-white px-8 py-4 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all duration-150 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 inline-block"
            >
              {loggedIn ? "Moje naloge" : "Objavi nalogo brezplačno"}
            </Link>
            <Link
              href={loggedIn ? "/naloge/vse" : "/register"}
              className="border border-[#333333] text-[#A3A3A3] px-8 py-4 rounded-xl text-sm font-medium hover:bg-[#1A1A1A] hover:border-[#444444] hover:text-white transition-all duration-150 hover:-translate-y-0.5 inline-block"
            >
              Postani izvajalec →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#2A2A2A] bg-[#141414]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14 sm:py-18 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 text-center hover:border-[#333333] transition-all duration-200">
              <p className="text-2xl mb-3">{s.icon}</p>
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1.5 tracking-tight">{s.value}</p>
              <p className="text-xs sm:text-sm text-[#525252]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kako deluje */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-24 sm:py-32">
        <div className="text-center mb-16">
          <p className="text-xs text-[#F97316] font-bold uppercase tracking-widest mb-4">Kako deluje</p>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">Tri preprosti koraki</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {KORAKI.map((k) => (
            <div
              key={k.st}
              className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-2xl hover:border-[#F97316]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-200 group cursor-default"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{k.icon}</span>
                <span className="text-4xl font-black text-[#2A2A2A] group-hover:text-[#F97316]/20 transition-colors duration-300 select-none leading-none">{k.st}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-3">{k.naslov}</h3>
              <p className="text-[#525252] text-sm leading-relaxed">{k.opis}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kategorije */}
      <section className="bg-[#141414] border-y border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 text-center">
          <p className="text-xs text-[#525252] font-semibold uppercase tracking-widest mb-8">Popularne kategorije</p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {KATEGORIJE.map((k) => (
              <Link
                key={k}
                href={loggedIn ? "/naloge/vse" : "/register"}
                className="text-sm bg-[#1A1A1A] text-[#A3A3A3] border border-[#2A2A2A] px-5 py-2.5 rounded-full hover:bg-[#F97316]/10 hover:text-orange-400 hover:border-[#F97316]/30 transition-all duration-150 font-medium"
              >
                {k}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-28 sm:py-36 text-center">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl px-8 py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(249,115,22,0.06),transparent)] pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 tracking-tight relative">Pripravljeni za začetek?</h2>
          <p className="text-[#A3A3A3] mb-10 text-sm sm:text-base max-w-md mx-auto leading-relaxed relative">
            Registracija je brezplačna in traja manj kot minuto. Objavi svojo prvo nalogo še danes.
          </p>
          <Link
            href={loggedIn ? "/naloge" : "/register"}
            className="relative inline-block bg-[#F97316] text-white px-10 py-4 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all duration-150 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5"
          >
            {loggedIn ? "Moje naloge →" : "Začni danes →"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-lg font-bold text-[#F97316]">Doago</span>
              <p className="text-xs text-[#525252] mt-1">Slovenska platforma za storitve · 2025</p>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs text-[#525252] justify-center">
              <Link href="/pogoji" className="hover:text-[#A3A3A3] transition-colors duration-150">Pogoji uporabe</Link>
              <Link href="/zasebnost" className="hover:text-[#A3A3A3] transition-colors duration-150">Politika zasebnosti</Link>
              <Link href="/zasebnost#piskotki" className="hover:text-[#A3A3A3] transition-colors duration-150">Piškotki</Link>
              <Link href="mailto:info@doago.si" className="hover:text-[#A3A3A3] transition-colors duration-150">Kontakt</Link>
              <Link href="mailto:info@doago.si" className="hover:text-[#A3A3A3] transition-colors duration-150">Pomoč</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
