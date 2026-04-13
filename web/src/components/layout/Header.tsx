import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="font-bold text-lg text-indigo-600 shrink-0">
          NetaWatch
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-600 overflow-x-auto">
          <Link href="/lok-sabha" className="hover:text-indigo-600 whitespace-nowrap">
            Lok Sabha
          </Link>
          <Link href="/rajya-sabha" className="hover:text-indigo-600 whitespace-nowrap">
            Rajya Sabha
          </Link>
          <Link href="/map" className="hover:text-indigo-600 whitespace-nowrap">
            Map
          </Link>
          <Link href="/about" className="hover:text-indigo-600 whitespace-nowrap">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
