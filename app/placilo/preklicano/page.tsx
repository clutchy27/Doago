"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PreklicanoContent() {
  const searchParams = useSearchParams();
  const nalogaId = searchParams.get("naloga_id");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Plačilo preklicano</h1>
        <p className="text-gray-500 text-sm mb-8">
          Plačilo je bilo preklicano. Naloga ostane sprejeta — plačilo lahko ponoviš kadarkoli.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 text-sm hover:shadow-lg hover:shadow-orange-500/20"
        >
          Nazaj na dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PreklicanoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-600">Nalaganje...</p>
      </div>
    }>
      <PreklicanoContent />
    </Suspense>
  );
}
