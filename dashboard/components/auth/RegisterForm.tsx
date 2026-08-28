"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import axios from "axios"
interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!username.trim()) e.username = "Username is required";
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      e.email = "Enter a valid email address";
    }
    if (!password) e.password = "Password is required";
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
      const res = await axios.post("http://localhost:3001/api/register", {
        username: username.trim(),
        email: email.trim(),
        password: password,
      });
      if (res.status === 200) {
              console.log(res.data);

      router.push(`/verifyotp?email=${encodeURIComponent(email)}`);       
       return;
      }
      if (res.status === 409) {
        setServerError("An account with this email already exists");
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
          Create account
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Get started with TraceFlow
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
            }}
            className={cn(errors.username && "border-[var(--color-destructive)]")}
          />
          {errors.username && (
            <p className="text-xs text-[var(--color-destructive)]">{errors.username}</p>
          )}
        </div>

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
            autoComplete="new-password"
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
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--color-foreground)] underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
