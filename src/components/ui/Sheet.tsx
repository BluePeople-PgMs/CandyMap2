"use client";

import { useEffect, useRef, type ReactNode } from "react";

type SheetProps = {
  title: string;
  titleId: string;
  onClose: () => void;
  children: ReactNode;
};

export function Sheet({ title, titleId, onClose, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-candy-orange/35 bg-candy-black px-4 pt-3 shadow-[0_-16px_40px_rgba(0,0,0,0.5)] outline-none"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/25" aria-hidden="true" />
        <h2 id={titleId} className="font-display text-3xl leading-none text-foreground">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
