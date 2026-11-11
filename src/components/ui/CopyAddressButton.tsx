"use client";

import { useCallback, useRef, useState } from "react";

type CopyAddressButtonProps = {
  address: string;
};

export function CopyAddressButton({ address }: CopyAddressButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<number | null>(null);

  const copy = useCallback(async () => {
    const text = address.trim();
    if (!text) {
      return;
    }

    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    resetTimer.current = window.setTimeout(() => setStatus("idle"), 2000);
  }, [address]);

  const label =
    status === "copied" ? "Copied" : status === "failed" ? "Could not copy" : "Copy address";

  return (
    <button
      type="button"
      onClick={() => void copy()}
      disabled={!address.trim()}
      aria-label={status === "idle" ? "Copy address to clipboard" : label}
      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-candy-orange/40 px-3 text-xs font-semibold text-candy-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40"
    >
      <span aria-live="polite">{label}</span>
    </button>
  );
}
