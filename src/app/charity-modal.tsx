"use client";

import React, { useEffect, useMemo, useState } from "react";

type PaymentMethod = "apple" | "card";

export type CharityModalProps = {
    open: boolean;
    onClose: () => void;
    baseAmount?: number;
    currency?: string;
    presetAmounts?: number[];
    onConfirm?: (tipAmount: number, method: PaymentMethod) => void;
};

function formatMoney(n: number, currency: string) {
    if (!Number.isFinite(n)) return `${currency}0.00`;
    return `${currency}${n.toFixed(2)}`;
}

function Money({
    amount,
    currency = "$",
    className,
}: {
    amount: number;
    currency?: string;
    className?: string;
}) {
    return (
        <span className={className}>
            <span className="text-[0.9em] opacity-70">{currency}</span>
            <span className="ml-0.5">{amount.toFixed(2)}</span>
        </span>
    );
}

export default function CharityModal({
    open,
    onClose,
    baseAmount = 0,
    currency = "$",
    presetAmounts = [7, 20, 50],
    onConfirm,
}: CharityModalProps) {
    const [selectedPreset, setSelectedPreset] = useState<number | null>(presetAmounts[0] ?? null);
    const [customMode, setCustomMode] = useState(false);
    const [customValue, setCustomValue] = useState<string>("");
    const [method, setMethod] = useState<PaymentMethod>("card");
    const [isLoading, setIsLoading] = useState(false);

    // ESC to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Reset when modal opens
    useEffect(() => {
        if (open) {
            setCustomMode(false);
            setSelectedPreset(presetAmounts[0] ?? null);
        }
    }, [open, presetAmounts]);

    // Calculate tip amount
    const tipAmount = useMemo(() => {
        if (customMode) {
            const n = parseFloat(customValue.replace(/[^\d.]/g, ""));
            return Number.isFinite(n) ? Math.max(0, n) : 0;
        }
        return typeof selectedPreset === "number" ? selectedPreset : 0;
    }, [customMode, customValue, selectedPreset]);

    const total = useMemo(() => baseAmount + tipAmount, [baseAmount, tipAmount]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end md:items-center md:justify-center"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            {/* Modal */}
            <div
                className="relative w-full md:max-w-md bg-[#0a1a14] border border-white/10 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative px-5 pt-5 pb-4 border-b border-white/5">
                <button
                    aria-label="Close"
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={onClose}
                >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Support Aqala</h2>
                            <p className="text-sm text-white/50">All proceeds go directly to charity</p>
                        </div>
                    </div>
                </div>

                {/* Amount Display */}
                <div className="px-5 py-4 bg-white/[0.02]">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Donation Amount</p>
                    <p className="text-3xl font-bold text-[#D4AF37]">
                        <Money amount={tipAmount} currency={currency} />
                    </p>
                </div>

                {/* Preset Amounts */}
                <div className="px-5 py-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                    {presetAmounts.map((amt, idx) => {
                        const active = !customMode && selectedPreset === amt;
                            return (
                            <button
                                key={amt}
                                onClick={() => {
                                    setCustomMode(false);
                                    setSelectedPreset(amt);
                                }}
                                    className={`relative h-14 rounded-xl font-semibold text-lg transition-all ${
                                        active
                                            ? "bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#D4AF37]"
                                            : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                                    }`}
                            >
                                <Money amount={amt} currency={currency} />
                                    {idx === 0 && (
                                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#0a1a14] text-[10px] font-semibold whitespace-nowrap">
                                            Most Popular
                                        </span>
                                    )}
                            </button>
                        );
                    })}
                </div>

                    {/* Custom Amount */}
                {!customMode ? (
                    <button
                        onClick={() => setCustomMode(true)}
                            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors py-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                            Enter custom amount
                    </button>
                ) : (
                        <div className="flex items-center gap-2 py-2">
                            <span className="text-xl text-white/50">{currency}</span>
                        <input
                            autoFocus
                                type="text"
                            inputMode="decimal"
                                placeholder="0.00"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                                className="flex-1 bg-transparent border-b-2 border-[#D4AF37]/50 focus:border-[#D4AF37] text-2xl text-white placeholder-white/30 outline-none py-2"
                            />
                            <button
                                onClick={() => {
                                    setCustomMode(false);
                                    setCustomValue("");
                                }}
                                className="text-white/40 hover:text-white p-1"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                    </div>
                )}
                </div>

                {/* Payment Method */}
                <div className="px-5 py-4 border-t border-white/5">
                    <p className="text-sm font-medium text-white/70 mb-3">Payment Method</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setMethod("apple")}
                            className={`flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all ${
                                method === "apple"
                                    ? "bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#D4AF37]"
                                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                                        }`}
                                >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                    </svg>
                            Pay
                        </button>
                        <button
                            onClick={() => setMethod("card")}
                            className={`flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all ${
                                method === "card"
                                    ? "bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#D4AF37]"
                                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                                        }`}
                                >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                <path d="M2 10h20" />
                            </svg>
                            Card
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-white/5">
                    <p className="text-xs text-white/40 mb-4 text-center">
                        By donating, you agree to Aqala's{" "}
                        <a href="/terms" className="text-[#D4AF37]/70 hover:text-[#D4AF37]">
                            terms of use
                        </a>
                    </p>
                    <button
                        onClick={async () => {
                            if (tipAmount <= 0) {
                                alert("Please select or enter a donation amount");
                                return;
                            }

                            setIsLoading(true);
                            try {
                                const response = await fetch("/api/checkout", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        amount: tipAmount,
                                        currency: "aud",
                                    }),
                                });

                                const data = await response.json();

                                if (!response.ok) {
                                    throw new Error(data.error || "Failed to create checkout session");
                                }

                                if (data.url) {
                                    window.location.href = data.url;
                                } else {
                                    throw new Error("No checkout URL received");
                                }
                            } catch (error: any) {
                                alert(error.message || "Something went wrong. Please try again.");
                                setIsLoading(false);
                            }
                        }}
                        disabled={isLoading || tipAmount <= 0}
                        className="w-full h-14 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#c9a431] hover:from-[#E8D5A3] hover:to-[#D4AF37] text-[#0a1a14] font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/20"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `Donate ${formatMoney(tipAmount, currency)}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
