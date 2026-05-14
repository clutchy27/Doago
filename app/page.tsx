"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Nav } from "@/components/Nav";

const STATS = [
  { value: "100+", label: "Objavljenih nalog" },
  { value: "50+", label: "Aktivnih izvajalcev" },
  { value: "4.8★", label: "Povprečna ocena" },
  { value: "24h", label: "Povprečen odzivni čas" },
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
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-x-hidden">

      {/* Nav */}
      {loggedIn ? (
        <Nav />
      ) : (
        <nav className="sticky top-0 z-40 bg-[#0F0F0F]/80 backdrop-blur-xl border-b border-white/8">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 grid grid-cols-3 items-center">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-[#F97316] hover:text-orange-400 transition-colors duration-150">
              Doago
            </Link>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Link
                href="/prijava"
                className="text-sm text-white/60 hover:text-white px-4 py-2 rounded-xl hover:bg-white/8 transition-all duration-150 font-medium"
              >
                Prijavi se
              </Link>
              <Link
                href="/register"
                className="text-sm bg-gradient-to-r from-[#F97316] to-[#ea580c] text-white px-5 py-2 rounded-xl font-semibold transition-all duration-150 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-px"
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
        {/* Warm background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F] via-[#1a0800] to-[#0F0F0F] pointer-events-none" />

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Large orange glow orb */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 w-[700px] h-[700px] bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Secondary green accent orb */}
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-28 sm:pt-40 pb-24 sm:pb-36 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-orange-400 text-xs font-semibold px-4 py-2 rounded-full mb-10 tracking-wide shadow-lg shadow-orange-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
            🇸🇮 Slovenska platforma za storitve
          </div>

          {/* Heading with gradient */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight mb-8">
            <span
              className="block"
              style={{
                backgroundImage: "linear-gradient(135deg, #ffffff 0%, #d4d4d4 50%, #a3a3a3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Potrebuješ pomoč?
            </span>
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #F97316 0%, #fb923c 50%, #fdba74 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Doago.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-white/50 max-w-xl mx-auto leading-relaxed mb-14">
            Poveži se z zaupanja vrednimi izvajalci za hišna opravila, prevoz, IT pomoč in še več.{" "}
            <span className="text-white/70">Hitro, preprosto, pošteno.</span>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={loggedIn ? "/naloge" : "/register"}
              className="relative inline-flex items-center gap-2 text-sm font-bold text-white px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group"
              style={{
                background: "linear-gradient(135deg, #F97316 0%, #ea580c 100%)",
                boxShadow: "0 0 30px rgba(249,115,22,0.35), 0 4px 20px rgba(249,115,22,0.2)",
              }}
            >
              <span>{loggedIn ? "Moje naloge" : "Objavi nalogo brezplačno"}</span>
              <svg className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href={loggedIn ? "/naloge/vse" : "/register"}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              Postani izvajalec
              <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-10 text-xs text-white/25 tracking-wide">
            Brezplačno · Brez kreditne kartice · Takoj aktivno
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F] via-[#141414] to-[#0F0F0F] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="relative bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl p-6 text-center overflow-hidden group hover:bg-white/8 hover:border-white/15 transition-all duration-300"
            >
              {/* Top accent gradient line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F97316]/60 to-transparent" />
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#F97316]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

              <p
                className="text-3xl sm:text-4xl font-extrabold mb-1.5 tracking-tight relative"
                style={{
                  backgroundImage: "linear-gradient(135deg, #F97316 0%, #fb923c 60%, #fcd34d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.value}
              </p>
              <p className="text-xs sm:text-sm text-white/40 relative">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kako deluje */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-28 sm:py-36">
        <div className="text-center mb-20">
          <p className="text-xs text-[#F97316] font-bold uppercase tracking-[0.2em] mb-5">Kako deluje</p>
          <h2
            className="text-3xl sm:text-5xl font-extrabold tracking-tight"
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Tri preprosti koraki
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {KORAKI.map((k, i) => (
            <div
              key={k.st}
              className="relative bg-white/[0.03] border border-white/8 p-8 rounded-2xl hover:-translate-y-1.5 hover:border-[#F97316]/30 transition-all duration-300 group overflow-hidden cursor-default"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F97316]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#F97316]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

              {/* Icon with glowing background */}
              <div className="relative mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center text-xl group-hover:bg-[#F97316]/15 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">
                  {k.icon}
                </div>
                <span className="absolute -top-1 -right-1 text-[#2A2A2A] text-5xl font-black select-none leading-none group-hover:text-[#F97316]/10 transition-colors duration-300">{k.st}</span>
              </div>

              <h3 className="text-base font-bold text-white mb-3 relative">{k.naslov}</h3>
              <p className="text-white/40 text-sm leading-relaxed relative">{k.opis}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kategorije */}
      <section className="relative border-y border-white/5">
        <div className="absolute inset-0 bg-[#141414] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-18 text-center">
          <p className="text-xs text-white/25 font-semibold uppercase tracking-[0.2em] mb-8">Popularne kategorije</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {KATEGORIJE.map((k) => (
              <Link
                key={k}
                href={loggedIn ? "/naloge/vse" : "/register"}
                className="text-sm bg-white/5 text-white/60 border border-white/8 px-5 py-2.5 rounded-full hover:bg-[#F97316]/10 hover:text-orange-400 hover:border-[#F97316]/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 font-medium backdrop-blur-sm"
              >
                {k}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-28 sm:py-36 text-center">
        <div
          className="relative rounded-3xl px-8 py-20 overflow-hidden border border-white/8"
          style={{
            background: "linear-gradient(135deg, #1a0800 0%, #0F0F0F 40%, #001a0a 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 60px rgba(249,115,22,0.08)",
          }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Glow top center */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

          <h2
            className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight relative"
            style={{
              backgroundImage: "linear-gradient(135deg, #ffffff 0%, #d4d4d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Pripravljeni za začetek?
          </h2>
          <p className="text-white/50 mb-12 text-sm sm:text-base max-w-md mx-auto leading-relaxed relative">
            Registracija je brezplačna in traja manj kot minuto. Objavi svojo prvo nalogo še danes.
          </p>
          <Link
            href={loggedIn ? "/naloge" : "/register"}
            className="relative inline-flex items-center gap-2 text-sm font-bold text-white px-10 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 group"
            style={{
              background: "linear-gradient(135deg, #F97316 0%, #ea580c 100%)",
              boxShadow: "0 0 40px rgba(249,115,22,0.40), 0 4px 24px rgba(249,115,22,0.25)",
            }}
          >
            {loggedIn ? "Moje naloge" : "Začni danes"}
            <svg className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-lg font-extrabold text-[#F97316] tracking-tight">Doago</span>
              <p className="text-xs text-white/20 mt-1">Slovenska platforma za storitve · 2025</p>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs text-white/25 justify-center">
              <Link href="/pogoji" className="hover:text-white/60 transition-colors duration-150">Pogoji uporabe</Link>
              <Link href="/zasebnost" className="hover:text-white/60 transition-colors duration-150">Politika zasebnosti</Link>
              <Link href="/zasebnost#piskotki" className="hover:text-white/60 transition-colors duration-150">Piškotki</Link>
              <Link href="mailto:info@doago.si" className="hover:text-white/60 transition-colors duration-150">Kontakt</Link>
              <Link href="mailto:info@doago.si" className="hover:text-white/60 transition-colors duration-150">Pomoč</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
