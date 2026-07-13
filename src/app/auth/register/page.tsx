"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthRegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryStr = searchParams.toString();
    router.replace(`/signup${queryStr ? `?${queryStr}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
    </div>
  );
}

export default function AuthRedirectRegisterPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
      </div>
    }>
      <AuthRegisterRedirect />
    </React.Suspense>
  );
}
