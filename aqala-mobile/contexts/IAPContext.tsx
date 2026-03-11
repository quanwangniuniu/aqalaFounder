import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Platform, Alert } from "react-native";
import { useAuth } from "./AuthContext";
import { useSubscription } from "./SubscriptionContext";
import { createOrUpdateSubscription } from "@/lib/firebase/subscriptions";

const PREMIUM_PRODUCT_ID = "com.aqala.premium";

let useIAP: any = null;
let ErrorCode: any = null;

try {
  const iap = require("expo-iap");
  useIAP = iap.useIAP;
  ErrorCode = iap.ErrorCode;
} catch {
  // Native module not available (Expo Go)
}

interface IAPContextType {
  products: any[];
  isPurchasing: boolean;
  isRestoring: boolean;
  isConnected: boolean;
  purchasePremium: () => void;
  restorePurchases: () => void;
  premiumProduct: any | null;
}

const IAPContext = createContext<IAPContextType | undefined>(undefined);

export const useIAPContext = () => {
  const ctx = useContext(IAPContext);
  if (!ctx) throw new Error("useIAPContext must be used within IAPProvider");
  return ctx;
};

function IAPProviderInner({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { refreshSubscription } = useSubscription();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handlePurchaseSuccess = useCallback(
    async (purchase: any) => {
      if (!user?.uid) return;

      try {
        const isApple = Platform.OS === "ios";
        await createOrUpdateSubscription(user.uid, {
          email: user.email || null,
          displayName: user.displayName || null,
          stripeCustomerId: "",
          plan: "premium",
          status: "active",
          purchasedAt: new Date(),
          source: isApple ? "apple" : "google",
          appleTransactionId: isApple
            ? purchase.transactionId || null
            : null,
          appleProductId: isApple ? purchase.productId || null : null,
          googleOrderId: !isApple
            ? purchase.transactionId || null
            : null,
          googleProductId: !isApple ? purchase.productId || null : null,
        });

        await refreshSubscription();

        // Finish transaction after granting entitlement
        await finishTransaction({ purchase, isConsumable: false });

        setIsPurchasing(false);
        Alert.alert(
          "Welcome to Premium!",
          "Ads have been removed. Thank you for supporting Aqala."
        );
      } catch (err) {
        console.error("Error processing purchase:", err);
        setIsPurchasing(false);
        Alert.alert("Error", "Purchase succeeded but failed to activate. Please tap Restore Purchases.");
      }
    },
    [user, refreshSubscription]
  );

  const handlePurchaseError = useCallback((error: any) => {
    setIsPurchasing(false);
    if (error?.code === ErrorCode?.UserCancelled) return;
    Alert.alert(
      "Purchase Failed",
      error?.message || "Something went wrong. Please try again."
    );
  }, []);

  const {
    connected,
    products,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
    availablePurchases,
  } = useIAP({
    onPurchaseSuccess: handlePurchaseSuccess,
    onPurchaseError: handlePurchaseError,
  });

  useEffect(() => {
    if (connected) {
      fetchProducts({
        skus: [PREMIUM_PRODUCT_ID],
        type: "in-app",
      });
    }
  }, [connected, fetchProducts]);

  const premiumProduct = products.find(
    (p: any) => p.id === PREMIUM_PRODUCT_ID || p.productId === PREMIUM_PRODUCT_ID
  ) || null;

  const purchasePremium = useCallback(() => {
    if (!premiumProduct) {
      Alert.alert("Not Available", "Unable to load product. Please try again later.");
      return;
    }
    setIsPurchasing(true);
    requestPurchase({
      request: {
        apple: { sku: PREMIUM_PRODUCT_ID },
        google: { skus: [PREMIUM_PRODUCT_ID] },
      },
      type: "in-app",
    });
  }, [premiumProduct, requestPurchase]);

  const restorePurchases = useCallback(async () => {
    if (!user?.uid) {
      Alert.alert("Sign In Required", "Please sign in to restore purchases.");
      return;
    }
    setIsRestoring(true);
    try {
      await getAvailablePurchases();
    } catch (err) {
      console.error("Restore error:", err);
      setIsRestoring(false);
      Alert.alert("Restore Failed", "Unable to restore purchases. Please try again.");
    }
  }, [user, getAvailablePurchases]);

  // Process restored purchases
  useEffect(() => {
    if (!isRestoring || !user?.uid) return;

    const hasPremium = availablePurchases?.some(
      (p: any) =>
        p.productId === PREMIUM_PRODUCT_ID || p.id === PREMIUM_PRODUCT_ID
    );

    if (hasPremium) {
      const isApple = Platform.OS === "ios";
      createOrUpdateSubscription(user.uid, {
        email: user.email || null,
        displayName: user.displayName || null,
        stripeCustomerId: "",
        plan: "premium",
        status: "active",
        purchasedAt: new Date(),
        source: isApple ? "apple" : "google",
      })
        .then(() => refreshSubscription())
        .then(() => {
          setIsRestoring(false);
          Alert.alert("Restored!", "Your premium purchase has been restored.");
        })
        .catch(() => {
          setIsRestoring(false);
          Alert.alert("Error", "Failed to restore. Please try again.");
        });
    } else {
      setIsRestoring(false);
      Alert.alert("No Purchases Found", "No previous premium purchase was found for this account.");
    }
  }, [availablePurchases, isRestoring, user, refreshSubscription]);

  return (
    <IAPContext.Provider
      value={{
        products,
        isPurchasing,
        isRestoring,
        isConnected: connected,
        purchasePremium,
        restorePurchases,
        premiumProduct,
      }}
    >
      {children}
    </IAPContext.Provider>
  );
}

function IAPProviderFallback({ children }: { children: ReactNode }) {
  return (
    <IAPContext.Provider
      value={{
        products: [],
        isPurchasing: false,
        isRestoring: false,
        isConnected: false,
        purchasePremium: () =>
          Alert.alert("Not Available", "In-app purchases are not available in this build."),
        restorePurchases: () =>
          Alert.alert("Not Available", "In-app purchases are not available in this build."),
        premiumProduct: null,
      }}
    >
      {children}
    </IAPContext.Provider>
  );
}

export const IAPProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  if (!useIAP) return <IAPProviderFallback>{children}</IAPProviderFallback>;
  return <IAPProviderInner>{children}</IAPProviderInner>;
};
