import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050814]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="h-6 w-6 rounded-md bg-gradient-to-br from-rose-500 to-violet-600 shadow-lg shadow-rose-500/40" />
          <span className="font-bold text-sm tracking-[0.22em] text-white">
            NETAWATCH
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-xs text-slate-400">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/5 whitespace-nowrap uppercase tracking-wider"
          >
            Overview
          </Link>
          <Link
            href="/map"
            className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/5 whitespace-nowrap uppercase tracking-wider"
          >
            Map
          </Link>
          <Link
            href="/about"
            className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/5 whitespace-nowrap uppercase tracking-wider"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
