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

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!emailPattern.test(email.trim())) {
      e.email = "Enter a valid email address";
    }
    if (!password) {
      e.password = "Password is required";
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const loginUrl = "https://traceflow-app-k2ed.vercel.app/api/login";

    try {
      console.log("[LOGIN DEBUG] ===== LOGIN REQUEST START =====");
      console.log("[LOGIN DEBUG] URL:", loginUrl);
      console.log("[LOGIN DEBUG] Email:", email.trim());

      const res = await fetch(loginUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const responseText = await res.text();
      let responseBody: unknown = responseText;

      try {
        responseBody = responseText ? JSON.parse(responseText) : null;
      } catch {
        // Keep the raw response when the server does not return JSON.
      }

      const debugInfo = {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        url: res.url,
        headers: Object.fromEntries(res.headers.entries()),
        body: responseBody,
      };

      if (res.ok) {
        console.log("[LOGIN DEBUG] Login successful:", debugInfo);
        console.log("[LOGIN DEBUG] ===== LOGIN REQUEST END =====");
        router.push("/dashboard");
        return;
      }

      console.error("[LOGIN DEBUG] Login API returned an error:", debugInfo);
      console.error("[LOGIN DEBUG] Server error details:", {
        status: res.status,
        error: typeof responseBody === "object" && responseBody !== null && "error" in responseBody
          ? responseBody.error
          : undefined,
        message: typeof responseBody === "object" && responseBody !== null && "message" in responseBody
          ? responseBody.message
          : undefined,
        rawBody: responseText,
      });
      console.log("[LOGIN DEBUG] ===== LOGIN REQUEST END =====");

      if (res.status === 401) {
        setServerError(
          typeof responseBody === "object" && responseBody !== null && "error" in responseBody
            ? String(responseBody.error)
            : "Invalid email or password"
        );
      } else if (res.status === 403) {
        setServerError(
          typeof responseBody === "object" && responseBody !== null && "error" in responseBody
            ? String(responseBody.error)
            : "Please verify your email first"
        );
      } else if (res.status >= 500) {
        setServerError(
          typeof responseBody === "object" && responseBody !== null && "message" in responseBody
            ? String(responseBody.message)
            : `Server error (${res.status}). Check browser console for details.`
        );
      } else {
        setServerError(
          typeof responseBody === "object" && responseBody !== null && "error" in responseBody
            ? String(responseBody.error)
            : `Login failed (${res.status}). Check browser console for details.`
        );
      }
    } catch (error) {
      console.error("[LOGIN DEBUG] ===== FETCH ERROR =====");
      console.error("[LOGIN DEBUG] Request failed before receiving a response:", error);
      console.error("[LOGIN DEBUG] Error details:", {
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: loginUrl,
      });
      console.error("[LOGIN DEBUG] ===== FETCH ERROR END =====");
      setServerError("Something went wrong, please check the browser console");
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
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
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
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            className={cn(errors.password && "border-[var(--color-destructive)]")}
          />
          {errors.password && (
            <p className="text-xs text-[var(--color-destructive)]">{errors.password}</p>
          )}
        </div>

        {serverError && (
          <p className="text-xs text-[var(--color-destructive)] rounded-md border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5 px-3 py-2">
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
          className="text-[var(--color-foreground)] underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
