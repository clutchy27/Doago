"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useMode } from "@/context/ModeContext";

export function Nav({ badge, current }: { badge?: number; current?: string }) {
  const [open, setOpen] = useState(false);
  const { mode, setMode } = useMode();
  const { data: session } = useSession();
  const userName = (session?.user as { name?: string } | undefined)?.name;

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link
          href="/naloge"
          className="text-xl font-bold shrink-0 transition-opacity hover:opacity-80"
          style={{ color: "var(--accent)" }}
        >
          Doago
        </Link>

        {/* Mode toggle — center */}
        <div className="flex bg-[#111111] border border-white/8 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode("narocnik")}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              mode === "narocnik"
                ? "bg-[#F97316] text-white shadow-md shadow-orange-500/25"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Naročnik
          </button>
          <button
            onClick={() => setMode("izvajalec")}
            className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              mode === "izvajalec"
                ? "bg-[#22C55E] text-white shadow-md shadow-green-500/25"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Izvajalec
          </button>
        </div>

        {/* Right: profile + logout (desktop) */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          {userName && (
            <Link
              href="/profil"
              className="relative flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                {userName[0].toUpperCase()}
              </span>
              <span>{userName}</span>
              {!!badge && badge > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent)" }}
                >
                  {badge}
                </span>
              )}
            </Link>
          )}
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={() => signOut({ callbackUrl: "/prijava" })}
            className="text-sm text-gray-500 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
          >
            Odjava
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors shrink-0"
          aria-label="Meni"
        >
          {!!badge && badge > 0 && (
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: "var(--accent)" }}
            />
          )}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-white/5 bg-[#0d0d0d] px-4 py-3 flex flex-col gap-1">
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="text-sm px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Moj profil{userName ? ` (${userName})` : ""}
          </Link>
          <div className="h-px bg-white/5 my-1" />
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: "/prijava" }); }}
            className="text-sm text-gray-500 hover:text-red-400 px-4 py-3 rounded-xl hover:bg-red-500/5 transition-all text-left"
          >
            Odjava
          </button>
        </div>
      )}
    </nav>
  );
}
