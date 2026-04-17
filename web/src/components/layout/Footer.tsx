import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050814] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Legal disclaimer — MUST appear on every page */}
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4 text-xs text-amber-200/80 leading-relaxed">
          <strong className="text-amber-200">Disclaimer:</strong> All
          information displayed on this site is sourced directly from
          affidavits self-declared by candidates and submitted to the Election
          Commission of India (ECI). NetaGirifiles is a civic transparency tool and
          does not make independent judgements about any individual. Pendency
          of a criminal case does not imply guilt. Data is provided for
          informational purposes only. Source:{" "}
          <a
            href="https://myneta.info"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-100"
          >
            myneta.info
          </a>{" "}
          (Association for Democratic Reforms).
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} NetaGirifiles</span>
          <nav className="flex gap-4">
            <Link href="/about" className="hover:text-slate-300">
              About
            </Link>
            <Link href="/disclaimer" className="hover:text-slate-300">
              Disclaimer
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
