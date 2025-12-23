"use client";

import React, { useEffect, useMemo, useState } from "react";

type PaymentMethod = "apple" | "card";

export type CharityModalProps = {
    open: boolean;
    onClose: () => void;
    baseAmount?: number; // total before tip (for "You pay"). Optional.
    currency?: string; // currency symbol, defaults to "$"
    presetAmounts?: number[]; // dollar presets
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
            <span style={{ fontSize: "calc(100% - 2px)" }}>{currency}</span>
            <span className="ml-1">{amount.toFixed(2)}</span>
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
    const [method, setMethod] = useState<PaymentMethod>("apple");
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

    // Reset custom input mode when the modal is opened
    useEffect(() => {
        if (open) {
            setCustomMode(false);
        }
    }, [open]);

    // Calculate tip amount
    const tipAmount = useMemo(() => {
        if (customMode) {
            const n = parseFloat(customValue.replace(/[^\d.]/g, ""));
            return Number.isFinite(n) ? Math.max(0, n) : 0;
        }
        return typeof selectedPreset === "number" ? selectedPreset : 0;
    }, [customMode, customValue, selectedPreset]);

    const total = useMemo(() => baseAmount + tipAmount, [baseAmount, tipAmount]);
    const firstSelected = useMemo(
        () => !customMode && typeof selectedPreset === "number" && selectedPreset === (presetAmounts[0] ?? null),
        [customMode, selectedPreset, presetAmounts]
    );
    const headerEmoji = firstSelected ? "😎" : "🥰";
    const headerEmojiClass = "text-4xl";

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end"
            aria-hidden={false}
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Sheet */}
            <div
                className="relative w-full bg-white rounded-t-2xl shadow-lg p-4 pt-6 min-h-[88vh] md:min-h-0 md:max-w-[800px] md:mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    aria-label="Close"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-100"
                    onClick={onClose}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                    >
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>

                {/* Header */}
                <div className="space-y-1 mb-4">
                    <h2 className="text-xl font-semibold">Your donation matters!</h2>
                    <p className="text-sm text-zinc-500">All proceeds go directly to charity!</p>
                </div>

                {/* Tip amount line with emoji */}
                <div className="flex items-center gap-3 mb-3">
                    <span className={headerEmojiClass} aria-hidden>
                        {headerEmoji}
                    </span>
                    <span className="text-lg">
                        Donation amount:{" "}
                        <Money amount={tipAmount} currency={currency} className="font-medium" />
                    </span>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {presetAmounts.map((amt, idx) => {
                        const active = !customMode && selectedPreset === amt;
                        const buttonEl = (
                            <button
                                key={amt}
                                onClick={() => {
                                    setCustomMode(false);
                                    setSelectedPreset(amt);
                                }}
                                className={`w-full h-16 rounded-xl border text-lg font-medium ${active
                                        ? "bg-violet-50 border-violet-400 text-violet-700"
                                        : "bg-white border-zinc-200 text-zinc-800"
                                    }`}
                            >
                                <Money amount={amt} currency={currency} />
                            </button>
                        );
                        if (idx === 0) {
                            return (
                                <div key={amt} className="relative pb-5 flex justify-center w-full">
                                    {buttonEl}
                                    <span className="absolute left-1/2 -translate-x-1/2 top-[72px] rounded-full bg-zinc-900 text-white text-xs min-w-[100px] text-center h-6 p-1">
                                        Most Common
                                    </span>
                                </div>
                            );
                        }
                        return buttonEl;
                    })}
                </div>

                {/* Custom donation row (turns into inline input when active) */}
                {!customMode ? (
                    <button
                        className="flex items-center gap-3 text-zinc-700 mb-3 py-4"
                        onClick={() => setCustomMode(true)}
                        aria-pressed={false}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 translate-y-[1px]"
                        >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span className="font-medium">Enter custom amount</span>
                    </button>
                ) : (
                    <div className="mb-4 flex items-center gap-3 pb-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5 text-zinc-700 translate-y-[1px]"
                            aria-hidden
                        >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span className="text-zinc-500" style={{ fontSize: "22px" }}>
                            {currency}
                        </span>
                        <input
                            autoFocus
                            inputMode="decimal"
                            placeholder="0"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            className="flex-1 border-0 border-b border-zinc-300 focus:border-violet-400 outline-none px-1 py-2 text-2xl leading-7"
                        />
                    </div>
                )}

                {/* Summary */}
                <div className="border-t border-zinc-200 pt-4 mt-2 mb-3">
                    <div className="text-sm text-zinc-500 mb-1">You donate:</div>
                    <div className="text-lg font-semibold">
                        <Money amount={total} currency={currency} />
                    </div>
                    <div className="text-xs text-zinc-500 mb-6">Your full donation goes to charity</div>
                </div>

                {/* Payment method */}
                <div className="mb-3">
                    <div className="text-base font-medium mb-4">Payment method</div>
                    <div className="space-y-0">
                        <button
                            onClick={() => setMethod("apple")}
                            className={`mb-4 w-full flex items-center justify-between rounded-xl px-3 py-4 border ${method === "apple" ? "bg-violet-50 border-violet-300" : "bg-white border-zinc-200"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`h-6 w-6 rounded-full flex items-center justify-center border ${method === "apple"
                                            ? "bg-violet-600 border-violet-600 text-white"
                                            : "border-zinc-300 text-transparent"
                                        }`}
                                >
                                    {/* white checkmark when selected */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="h-3.5 w-3.5"
                                    >
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                </span>
                                <span className="font-medium">Apple Pay</span>
                            </div>
                            <span className="text-2xl" aria-hidden></span>
                        </button>
                        <button
                            onClick={() => setMethod("card")}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-4 border ${method === "card" ? "bg-violet-50 border-violet-300" : "bg-white border-zinc-200"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`h-6 w-6 rounded-full flex items-center justify-center border ${method === "card"
                                            ? "bg-violet-600 border-violet-600 text-white"
                                            : "border-zinc-300 text-transparent"
                                        }`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="h-3.5 w-3.5"
                                    >
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                </span>
                                <span className="font-medium">Card</span>
                            </div>
                            {/* card icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-6 w-6 text-black"
                                aria-hidden
                            >
                                <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                                <path d="M3 10h18" />
                                <path d="M7 15h4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Pay button */}
                <div className="mt-4 pt-0">
                    <p className="text-sm text-zinc-500 mb-3">
                        By clicking on pay you agree with Aqala’s{" "}
                        <a href="#" className="text-zinc-500">
                            terms of use
                        </a>
                        .
                    </p>
                    <div className="h-px bg-zinc-200 mb-4" />
                </div>
                <div className="mt-2">
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
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
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
                                    // Redirect to Stripe Checkout
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
                        className="w-full h-14 rounded-full bg-black text-white text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            "Processing..."
                        ) : method === "apple" ? (
                            <span className="inline-flex items-center gap-2">
                                <span>Pay with</span>
                                <span className="inline-flex items-center text-2xl leading-none">
                                    <span aria-hidden></span>
                                    <span className="ml-1">Pay</span>
                                </span>
                            </span>
                        ) : (
                            "Pay with Card"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}


