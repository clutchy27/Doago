"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";

export type NavPage = "dashboard" | "naloge" | "profil" | "objavi";

export function Nav({ current, badge }: { current?: NavPage; badge?: number }) {
  const [open, setOpen] = useState(false);

  const item = (href: string, label: string, page?: NavPage) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`text-sm px-4 py-2 rounded-xl transition-all duration-150 ${
        current === page
          ? "text-white bg-white/10 font-medium"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors duration-150 shrink-0"
        >
          Doago
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-0.5">
          {item("/dashboard", "Dashboard", "dashboard")}
          {item("/naloge", "Vse naloge", "naloge")}
          <div className="relative">
            {item("/profil", "Moj profil", "profil")}
            {!!badge && badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
                {badge}
              </span>
            )}
          </div>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <button
            onClick={() => signOut({ callbackUrl: "/prijava" })}
            className="text-sm text-gray-400 hover:text-white hover:bg-white/5 px-4 py-2 rounded-xl transition-all duration-150"
          >
            Odjava
          </button>
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-3">
          {!!badge && badge > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {badge}
            </span>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Meni"
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-white/5 bg-[#0d0d0d] px-4 py-3 flex flex-col gap-1">
          {(["dashboard", "naloge", "profil"] as const).map((page) => {
            const labels: Record<string, string> = { dashboard: "Dashboard", naloge: "Vse naloge", profil: "Moj profil" };
            const hrefs: Record<string, string> = { dashboard: "/dashboard", naloge: "/naloge", profil: "/profil" };
            return (
              <Link
                key={page}
                href={hrefs[page]}
                onClick={() => setOpen(false)}
                className={`text-sm px-4 py-3 rounded-xl transition-all ${
                  current === page ? "text-white bg-white/10 font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {labels[page]}
              </Link>
            );
          })}
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
