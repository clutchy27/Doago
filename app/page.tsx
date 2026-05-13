"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
  },
  {
    st: "02",
    naslov: "Izvajalec sprejme",
    opis: "Usposobljeni izvajalci vidijo tvojo nalogo in jo sprejmejo. Takoj prejmeš obvestilo.",
  },
  {
    st: "03",
    naslov: "Oceni in zaključi",
    opis: "Ko je naloga opravljena, jo označi kot zaključeno in oceni izvajalca z 1–5 zvezdicami.",
  },
];

const KATEGORIJE = ["Hišna opravila", "Prevoz", "IT pomoč", "Pouk", "Vrtnarjenje", "Dostava", "Čiščenje", "Montaža"];

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/naloge");
  }, [status, router]);

  if (status === "loading") return <div className="min-h-screen bg-[#0a0a0a]" />;
  if (status === "authenticated") return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors duration-150">
            Doago
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/prijava"
              className="text-sm text-gray-400 hover:text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-white/5 transition-all duration-150"
            >
              Prijava
            </Link>
            <Link
              href="/register"
              className="text-sm bg-orange-500 text-white px-4 sm:px-5 py-2 rounded-xl font-medium hover:bg-orange-600 transition-all duration-150 hover:shadow-lg hover:shadow-orange-500/20"
            >
              Začni brezplačno
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(249,115,22,0.07),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-20 sm:pt-32 pb-20 sm:pb-28 text-center relative">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            Slovenska platforma za storitve
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            Potrebuješ pomoč?
            <br />
            <span className="text-orange-500">Doago.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-10">
            Poveži se z zaupanja vrednimi izvajalci za hišna opravila, prevoz, IT pomoč in še več. Hitro, preprosto, pošteno.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-orange-500 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all duration-150 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-0.5 inline-block"
            >
              Objavi nalogo
            </Link>
            <Link
              href="/register"
              className="border border-white/10 text-gray-300 px-8 py-3.5 rounded-xl text-sm hover:bg-white/5 hover:border-white/20 transition-all duration-150 hover:-translate-y-0.5 inline-block"
            >
              Postani izvajalec →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-[#0d0d0d]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1.5">{s.value}</p>
              <p className="text-xs sm:text-sm text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kako deluje */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
        <div className="text-center mb-14">
          <p className="text-xs text-orange-500 font-semibold uppercase tracking-widest mb-3">Kako deluje</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Tri preprosti koraki</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {KORAKI.map((k) => (
            <div
              key={k.st}
              className="bg-[#111111] border border-white/5 p-8 rounded-2xl hover:border-white/10 hover:-translate-y-1 transition-all duration-200 group cursor-default"
            >
              <p className="text-5xl font-bold text-white/8 group-hover:text-orange-500/15 mb-5 transition-colors duration-300 select-none">
                {k.st}
              </p>
              <h3 className="text-base font-semibold text-white mb-2">{k.naslov}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{k.opis}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kategorije */}
      <section className="bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-6">Popularne kategorije</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {KATEGORIJE.map((k) => (
              <Link
                key={k}
                href="/register"
                className="text-sm bg-white/5 text-gray-400 border border-white/8 px-4 py-2 rounded-full hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/20 transition-all duration-150"
              >
                {k}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-24 sm:py-32 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Pripravljeni za začetek?</h2>
        <p className="text-gray-500 mb-10 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Registracija je brezplačna in traja manj kot minuto. Objavi svojo prvo nalogo še danes.
        </p>
        <Link
          href="/register"
          className="inline-block bg-orange-500 text-white px-10 py-4 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all duration-150 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
        >
          Začni danes →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-lg font-bold text-orange-500">Doago</span>
              <p className="text-xs text-gray-700 mt-1">Slovenska platforma za storitve · 2025</p>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs text-gray-600 justify-center">
              <Link href="/pogoji" className="hover:text-gray-300 transition-colors duration-150">Pogoji uporabe</Link>
              <Link href="/zasebnost" className="hover:text-gray-300 transition-colors duration-150">Politika zasebnosti</Link>
              <Link href="/zasebnost#piskotki" className="hover:text-gray-300 transition-colors duration-150">Piškotki</Link>
              <Link href="mailto:info@doago.si" className="hover:text-gray-300 transition-colors duration-150">Kontakt</Link>
              <Link href="mailto:info@doago.si" className="hover:text-gray-300 transition-colors duration-150">Pomoč</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
