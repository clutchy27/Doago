"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function UspehContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) { setStatus("error"); return; }

    fetch(`/api/placilo/verify?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.paid ? "ok" : "error");
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <p className="text-gray-500">Preverjam plačilo...</p>
        )}

        {status === "ok" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Plačilo uspešno!</h1>
            <p className="text-gray-500 text-sm mb-8">
              Plačilo je bilo potrjeno. Status naloge je posodobljen na <span className="text-purple-400 font-medium">plačano</span>.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-150 text-sm hover:shadow-lg hover:shadow-orange-500/20"
            >
              Nazaj na dashboard
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Napaka pri plačilu</h1>
            <p className="text-gray-500 text-sm mb-8">
              Plačila ni bilo mogoče potrditi. Prosimo, kontaktirajte podporo.
            </p>
            <Link
              href="/dashboard"
              className="inline-block border border-white/10 text-gray-400 px-8 py-3 rounded-xl font-semibold hover:bg-white/5 transition-all duration-150 text-sm"
            >
              Nazaj na dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function UspehPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-600">Nalaganje...</p>
      </div>
    }>
      <UspehContent />
    </Suspense>
  );
}
