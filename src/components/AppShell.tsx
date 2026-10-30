"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

function showsBottomNav(pathname: string) {
  return (
    !pathname.startsWith("/houses") && !pathname.startsWith("/neighborhoods")
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = showsBottomNav(pathname);

  // Fixed viewport: the map fills the space under the header, and the page itself does not scroll.
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-candy-black">
      <header
        className="sticky top-0 z-40 flex items-center justify-between border-b border-candy-orange/20 bg-candy-black/90 px-4 backdrop-blur-md"
        style={{
          paddingTop: "calc(0.75rem + env(safe-area-inset-top))",
          paddingBottom: "0.75rem",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <p className="font-display text-xl tracking-wide text-candy-orange">
          CandyMap
        </p>
        <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/65">
          Halloween 2026
        </p>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        style={{
          paddingBottom: showNav
            ? "calc(3.5rem + env(safe-area-inset-bottom))"
            : "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        {children}
      </div>

      {showNav ? <BottomNav /> : null}
    </div>
  );
}
