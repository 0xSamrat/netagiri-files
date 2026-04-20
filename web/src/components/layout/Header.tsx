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
        <a
          href="https://github.com/0xSamrat/netagiri-files"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          className="hidden sm:flex h-8 w-8 rounded-full bg-white/[0.04] border border-white/5 items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
}
