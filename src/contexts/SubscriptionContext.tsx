"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { subscribeToSubscription, getSubscription } from "@/lib/firebase/subscriptions";
import { Subscription, SubscriptionPlan } from "@/types/subscription";

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  plan: SubscriptionPlan;
  isPremium: boolean;
  showAds: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?.uid) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToSubscription(
      user.uid,
      (sub) => {
        setSubscription(sub);
        setLoading(false);
      },
      (err) => {
        console.error("Subscription subscription error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const refreshSubscription = async () => {
    if (!user?.uid) return;
    try {
      const sub = await getSubscription(user.uid);
      setSubscription(sub);
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  };

  const plan: SubscriptionPlan = subscription?.plan || "free";
  const isPremium = plan === "premium" && subscription?.status === "active";
  const showAds = !isPremium; // Show ads to free users

  const value: SubscriptionContextType = {
    subscription,
    loading,
    plan,
    isPremium,
    showAds,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
