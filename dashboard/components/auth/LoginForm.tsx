"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

interface FieldErrors {
  email?: string;
  password?: string;
}

interface LoginResponse {
  error?: string;
  message?: string;
  handoffCode?: string;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const fieldErrors: FieldErrors = {};
    const emailPattern = /^\S+@\S+\.\S+$/;

    if (!email.trim()) {
      fieldErrors.email = "Email is required";
    } else if (!emailPattern.test(email.trim())) {
      fieldErrors.email = "Enter a valid email address";
    }

    if (!password) fieldErrors.password = "Password is required";
    return fieldErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const loginResponse = await fetch(
        "https://traceflow-app-k2ed.vercel.app/api/login",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        }
      );

      const loginData = (await loginResponse.json()) as LoginResponse;

      if (!loginResponse.ok) {
        setServerError(loginData.error || loginData.message || "Unable to sign in");
        return;
      }

      if (!loginData.handoffCode) {
        await fetch("https://traceflow-app-k2ed.vercel.app/api/logout", {
          method: "POST",
          credentials: "include",
        }).catch(() => undefined);
        setServerError("Dashboard authentication is not ready on the backend yet. Please try again shortly.");
        return;
      }

      // The one-time code is short-lived and single-use. The backend accessToken
      // remains HttpOnly on the backend origin and is never read by this client.
      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handoffCode: loginData.handoffCode }),
        cache: "no-store",
      });

      if (!sessionResponse.ok) {
        const sessionData = (await sessionResponse.json().catch(() => null)) as
          | { message?: string }
          | null;
        await fetch("https://traceflow-app-k2ed.vercel.app/api/logout", {
          method: "POST",
          credentials: "include",
        }).catch(() => undefined);
        setServerError(
          sessionData?.message || "Unable to establish your dashboard session. Please sign in again."
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("[LOGIN] Request failed:", error);
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Sign in
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Welcome back to TraceFlow
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) setErrors((previous) => ({ ...previous, email: undefined }));
            }}
            className={cn(errors.email && "border-[var(--color-destructive)]")}
          />
          {errors.email && (
            <p className="text-xs text-[var(--color-destructive)]">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (errors.password) setErrors((previous) => ({ ...previous, password: undefined }));
            }}
            className={cn(errors.password && "border-[var(--color-destructive)]")}
          />
          {errors.password && (
            <p className="text-xs text-[var(--color-destructive)]">{errors.password}</p>
          )}
        </div>

        {serverError && (
          <p
            role="alert"
            className="rounded-md border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5 px-3 py-2 text-xs text-[var(--color-destructive)]"
          >
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[var(--color-foreground)] underline underline-offset-4 transition-opacity hover:opacity-80"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
