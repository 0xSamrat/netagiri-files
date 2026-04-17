"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/lok-sabha", label: "Lok Sabha" },
  { href: "/map", label: "Map" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060814]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="h-6 w-6 rounded-md bg-[#ff2d87] shadow-lg shadow-[#ff2d87]/40" />
          <span className="hidden sm:inline font-bold text-sm tracking-[0.22em] text-white">
            NETAGIRI<span className="text-[#ff2d87]">FILES</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/5">
          {TABS.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider whitespace-nowrap transition-colors ${
                  active
                    ? "bg-[#ff2d87] text-white shadow-lg shadow-[#ff2d87]/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden sm:flex h-8 w-8 rounded-full bg-white/[0.04] border border-white/5 items-center justify-center text-[10px] text-slate-400">
          NW
        </div>
      </div>
    </header>
  );
}
