import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Legal disclaimer — MUST appear on every page */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> All information displayed on this site is
          sourced directly from affidavits self-declared by candidates and
          submitted to the Election Commission of India (ECI). NetaWatch is a
          civic transparency tool and does not make independent judgements about
          any individual. Pendency of a criminal case does not imply guilt. Data
          is provided for informational purposes only. Source:{" "}
          <a
            href="https://myneta.info"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-900"
          >
            myneta.info
          </a>{" "}
          (Association for Democratic Reforms).
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} NetaWatch</span>
          <nav className="flex gap-4">
            <Link href="/about" className="hover:text-gray-600">
              About
            </Link>
            <Link href="/methodology" className="hover:text-gray-600">
              Methodology
            </Link>
            <Link href="/disclaimer" className="hover:text-gray-600">
              Disclaimer
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
