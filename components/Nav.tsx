"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useMode } from "@/context/ModeContext";

export function Nav({ badge, current }: { badge?: number; current?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { mode, setMode } = useMode();
  const { data: session } = useSession();
  const userName = (session?.user as { name?: string } | undefined)?.name;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link
          href="/"
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

        {/* Right: user dropdown (desktop) */}
        <div className="hidden sm:flex items-center shrink-0 relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
          >
            <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
              {userName ? userName[0].toUpperCase() : "?"}
            </span>
            {userName && <span>{userName}</span>}
            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {!!badge && badge > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent)" }}
              >
                {badge}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-44 bg-[#111111] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              <Link
                href="/naloge"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Moje naloge
              </Link>
              <Link
                href="/naloge/vse"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Vse naloge
              </Link>
              <Link
                href="/profil"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Profil
              </Link>
              <div className="h-px bg-white/8 mx-2" />
              <button
                onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/prijava" }); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                Odjava
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
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
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-white/5 bg-[#0d0d0d] px-4 py-3 flex flex-col gap-1">
          {userName && (
            <div className="flex items-center gap-2 px-4 py-2 mb-1">
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                {userName[0].toUpperCase()}
              </span>
              <span className="text-sm text-gray-300">{userName}</span>
            </div>
          )}
          <Link
            href="/naloge"
            onClick={() => setMobileOpen(false)}
            className="text-sm px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Moje naloge
          </Link>
          <Link
            href="/naloge/vse"
            onClick={() => setMobileOpen(false)}
            className="text-sm px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Vse naloge
          </Link>
          <Link
            href="/profil"
            onClick={() => setMobileOpen(false)}
            className="text-sm px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Profil
          </Link>
          <div className="h-px bg-white/5 my-1" />
          <button
            onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/prijava" }); }}
            className="text-sm text-gray-500 hover:text-red-400 px-4 py-3 rounded-xl hover:bg-red-500/5 transition-all text-left"
          >
            Odjava
          </button>
        </div>
      )}
    </nav>
  );
}
