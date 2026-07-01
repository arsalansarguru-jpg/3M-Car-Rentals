"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Retrieve origin redirect path from query strings (defaults to client dashboard)
  const redirectDestination = searchParams.get("redirect") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Connect to the Supabase Auth live server
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setAuthError(signInError.message);
      } else {
        // Successful login, navigate to destination
        router.push(redirectDestination);
        router.refresh();
      }
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-card border border-gray-200 shadow-sm">
        {/* Luxury Brand Header */}
        <div className="text-center">
          <span className="text-overline text-accent-gold tracking-widest bg-primary-700/10 px-3 py-1 rounded-badge">
            Secure Entry
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-500 text-small-body">
            Log in to manage your premium bookings and luxury fleet access.
          </p>
        </div>

        {/* Global error state message */}
        {authError && (
          <div className="p-4 rounded-button bg-red-50 border border-red-200 text-sm text-error font-medium">
            {authError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 select-none cursor-pointer"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="/auth/forgot-password"
                className="font-semibold text-accent-blue hover:text-[#1d4ed8]"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Sign In to Dashboard
          </Button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/register"
              className="font-semibold text-accent-blue hover:text-[#1d4ed8]"
            >
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary text-primary-900 font-semibold">
        Loading...
      </div>
    }>
      <LoginForm />
    </React.Suspense>
  );
}
