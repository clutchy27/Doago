"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/naloge"); }, [router]);
  return <div className="min-h-screen bg-[#0a0a0a]" />;
}
