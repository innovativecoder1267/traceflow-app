"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  CreditCard,
  LogOut,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/providers/SubscriptionProvider";

interface AccountProfile {
  username: string;
  email: string;
  verified: boolean;
  subscription: "free" | "premium";
  createdAt?: string;
}

const API_BASE_URL = "https://traceflow-app-k2ed.vercel.app/api";

export default function SettingsPage() {
  const router = useRouter();
  const { subscription } = useSubscription();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const response = await axios.get<{ user: AccountProfile }>(
          `${API_BASE_URL}/account`,
          { withCredentials: true }
        );
        if (!cancelled) setProfile(response.data.user);
      } catch (requestError) {
        if (cancelled) return;

        if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
          router.replace("/login");
          router.refresh();
          return;
        }

        setError("We couldn't load your account information. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAccount();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const [dashboardLogout, backendLogout] = await Promise.all([
        fetch("/api/auth/logout", {
          method: "POST",
          cache: "no-store",
        }),
        fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          credentials: "include",
        }),
      ]);

      if (!dashboardLogout.ok || !backendLogout.ok) {
        throw new Error("One or more sessions could not be cleared");
      }

      setProfile(null);
      router.replace("/login");
      router.refresh();
    } catch (logoutError) {
      console.error("[LOGOUT] Logout request failed:", logoutError);
      setError("We couldn't clear both sessions. Please try again.");
      setLoggingOut(false);
    }
  }

  const plan = profile?.subscription ?? subscription;

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Manage your account and TraceFlow subscription.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-[var(--color-destructive)]/25 bg-[var(--color-destructive)]/5 p-3 text-sm text-[var(--color-destructive)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)]">
            <UserRound className="h-5 w-5 text-[var(--color-foreground)]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
              Account information
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Your profile details associated with TraceFlow.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-md bg-[var(--color-accent)]" />
            ))}
          </div>
        ) : profile ? (
          <div className="divide-y divide-[var(--color-border)]">
            <AccountRow icon={<UserRound className="h-4 w-4" />} label="Name" value={profile.username} />
            <AccountRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
            <AccountRow
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Email verification"
              value={profile.verified ? "Verified" : "Not verified"}
              badge={profile.verified ? "success" : "neutral"}
            />
            <AccountRow
              icon={<CalendarDays className="h-4 w-4" />}
              label="Member since"
              value={profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            />
          </div>
        ) : (
          <p className="p-5 text-sm text-[var(--color-muted-foreground)]">
            Account information is currently unavailable.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]">
            <CreditCard className="h-5 w-5 text-[var(--color-foreground)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
              Subscription plan
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Your current TraceFlow plan.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm font-medium capitalize text-[var(--color-foreground)]">
                {loading ? "Loading…" : plan}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {plan === "premium"
                  ? "Premium analytics access is enabled."
                  : "Core tracing is available on your current plan."}
              </span>
            </div>
            <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
              Plan upgrades and billing management will be added in a future release.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
            Sign out
          </h2>
          <p className="mt-1 max-w-md text-xs leading-5 text-[var(--color-muted-foreground)]">
            Sign out of this session on this browser. You’ll need to sign in again to access your dashboard.
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          disabled={loggingOut}
          className="shrink-0"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {loggingOut ? "Signing out…" : "Log out"}
        </Button>
      </section>
    </div>
  );
}

function AccountRow({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: "success" | "neutral";
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="text-[var(--color-muted-foreground)]">{icon}</span>
      <span className="w-32 shrink-0 text-sm text-[var(--color-muted-foreground)]">{label}</span>
      <span className="ml-auto flex items-center gap-2 text-right text-sm font-medium text-[var(--color-foreground)]">
        {badge && (
          <span
            className={
              badge === "success"
                ? "h-1.5 w-1.5 rounded-full bg-[var(--color-success)]"
                : "h-1.5 w-1.5 rounded-full bg-[var(--color-muted-foreground)]"
            }
          />
        )}
        <span className="break-all">{value}</span>
      </span>
    </div>
  );
}
