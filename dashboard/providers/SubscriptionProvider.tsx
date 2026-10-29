"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export type SubscriptionPlan = "free" | "premium";

interface SubscriptionContextValue {
  subscription: SubscriptionPlan;
  isSubscriptionLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined
);

const API_BASE_URL = "https://traceflow-app-k2ed.vercel.app/api";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionPlan>("free");
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    setIsSubscriptionLoading(true);

    try {
      const response = await axios.get<{ subscription?: SubscriptionPlan }>(
        `${API_BASE_URL}/subscription`,
        { withCredentials: true }
      );

      setSubscription(
        response.data.subscription === "premium" ? "premium" : "free"
      );
    } catch (error) {
      // Fail closed for premium UI: an unavailable status never unlocks it.
      console.error("[SUBSCRIPTION] Failed to fetch subscription status:", error);
      setSubscription("free");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.replace("/login");
        router.refresh();
      }
    } finally {
      setIsSubscriptionLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void refreshSubscription();
  }, [refreshSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{ subscription, isSubscriptionLoading, refreshSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }

  return context;
}
