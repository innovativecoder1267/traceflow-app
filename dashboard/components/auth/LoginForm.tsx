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
    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        credentials:"include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) {
        router.push("/dashboard");
        return;
      }
      if (res.status === 401) {
        setServerError("Invalid email or password");
      } else {
        setServerError("Something went wrong, please try again");
      }
    } catch {
      setServerError("Something went wrong, please try again");
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
