"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function checkRoleAndRedirect() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth/login");
        return;
      }
      
      const { data: userData } = await supabase
        .from("users")
        .select("role:roles(name)")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      const role = (userData as unknown as { role: { name: string } | null })?.role?.name || "customer";
      const isAdmin = ["admin", "super_admin", "manager", "staff"].includes(role);

      if (isAdmin) {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/client");
      }
    }
    checkRoleAndRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-[#c9a84c]/20 border-t-[#c9a84c] rounded-full animate-spin" />
    </div>
  );
}
