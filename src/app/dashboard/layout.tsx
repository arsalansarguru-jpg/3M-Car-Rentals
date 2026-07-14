import React from "react";
import { requireCustomer } from "@/services/auth-helpers";
import { redirect } from "next/navigation";
import CustomerDashboardClientLayout from "./layout-client";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function CustomerDashboardLayout({ children }: DashboardLayoutProps) {
  // Enforce customer session verification on the server before layout hydration
  const resolved = await requireCustomer();

  // If the customer profile is incomplete, redirect them to onboarding wizard
  const profile = resolved.profile;
  const isProfileComplete = profile && profile.profile_completed_percent === 100;
  if (!isProfileComplete) {
    redirect("/onboarding");
  }

  return (
    <CustomerDashboardClientLayout user={resolved.user} profile={resolved.profile}>
      {children}
    </CustomerDashboardClientLayout>
  );
}
