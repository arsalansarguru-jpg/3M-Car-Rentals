"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/types/auth";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setAuthError(null);
    setSuccessMsg(null);

    try {
      // Connect to the Supabase Auth live system, passing metadata matching our postgres trigger schema
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          },
        },
      });

      if (signUpError) {
        setAuthError(signUpError.message);
      } else {
        setSuccessMsg(
          "Registration successful! Please check your email inbox to verify your account."
        );
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
        {/* Header */}
        <div className="text-center">
          <span className="text-overline text-accent-gold tracking-widest bg-primary-700/10 px-3 py-1 rounded-badge">
            Create Account
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary-900">
            Join 3M Car Rentals
          </h2>
          <p className="mt-2 text-sm text-gray-500 text-small-body">
            Register below to search, book, and drive Goa&apos;s premium fleet.
          </p>
        </div>

        {/* Status Messages */}
        {authError && (
          <div className="p-4 rounded-button bg-red-50 border border-red-200 text-sm text-error font-medium animate-fadeIn">
            {authError}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-button bg-green-50 border border-green-200 text-sm text-success font-medium animate-fadeIn">
            {successMsg}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="firstName"
                label="First Name"
                placeholder="Aarav"
                error={errors.firstName?.message}
                {...register("firstName")}
              />

              <Input
                id="lastName"
                label="Last Name"
                placeholder="Sharma"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

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
              id="phone"
              label="Mobile Number"
              type="tel"
              placeholder="+91 9876543210"
              helperText="Include country code for verification."
              error={errors.phone?.message}
              {...register("phone")}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••••••"
              helperText="Must be at least 12 characters with complex patterns."
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div className="space-y-4 text-sm mt-6">
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-accent-blue focus:ring-accent-blue mt-0.5"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700 select-none cursor-pointer"
              >
                I hold a valid driving license and agree to the 3M Car Rentals Terms & Conditions and Privacy Policy.
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Create Account & Verify
          </Button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-semibold text-accent-blue hover:text-[#1d4ed8]"
            >
              Log in here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
