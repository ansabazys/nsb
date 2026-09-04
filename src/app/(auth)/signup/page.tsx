"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Check your email
        </h1>
        <p className="text-xs text-neutral-400">
          We sent a verification link to <span className="text-white font-medium">{email}</span>.
        </p>
        <Link href="/login">
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-neutral-700 text-white hover:bg-neutral-900 rounded-md"
          >
            Return to Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Create Account
        </h1>
        <p className="text-xs text-neutral-400">
          Set up your personal Life Operating System
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs text-red-300 bg-red-950/40 border border-red-800/60 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
          className="rounded-md bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
        />

        <Input
          type="email"
          label="Email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="rounded-md bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="rounded-md bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-[34px] text-neutral-400 hover:text-neutral-200 transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full rounded-md py-2.5 bg-white text-black font-medium hover:bg-neutral-200 transition-all active:scale-[0.99] disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="text-center text-xs text-neutral-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-white font-medium hover:underline transition-all underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
