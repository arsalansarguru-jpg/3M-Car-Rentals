import React from "react";
import { requireAdmin } from "@/services/auth-helpers";
import AdminDashboardClientLayout from "./layout-client";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  // Enforce admin/staff authorization on the server side prior to rendering client components
  const resolved = await requireAdmin();

  return (
    <AdminDashboardClientLayout user={resolved.user} profile={resolved.profile}>
      {children}
    </AdminDashboardClientLayout>
  );
}
