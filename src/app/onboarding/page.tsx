import React from "react";
import { requireCustomer } from "@/services/auth-helpers";
import { redirect } from "next/navigation";
import OnboardingWizardClient from "./onboarding-client";

export default async function OnboardingPage() {
  // Enforce customer session verification on the server
  const resolved = await requireCustomer();
  const profile = resolved.profile;

  // If profile is already complete, redirect directly to /dashboard
  const isProfileComplete = profile && profile.profile_completed_percent === 100;
  if (isProfileComplete) {
    redirect("/dashboard");
  }

  return (
    <OnboardingWizardClient user={resolved.user} initialProfile={profile} />
  );
}
