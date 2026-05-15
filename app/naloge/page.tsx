"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NalogeRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/naloge/vse"); }, [router]);
  return <div className="min-h-screen bg-[#0F0F0F]" />;
}
