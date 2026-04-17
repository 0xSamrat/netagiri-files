import Link from "next/link";
import { LinkedInIcon, XIcon } from "@/components/ui/ShareIcons";

function GitHubIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 00-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.74-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.3 1.18-3.1-.12-.29-.51-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11 11 0 015.78 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.6.24 2.78.12 3.07.74.8 1.18 1.84 1.18 3.1 0 4.44-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0012 .5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 4h20a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V6a2 2 0 012-2zm10 8.5L22 6H2l10 6.5zM2 8.2V18h20V8.2l-10 6.5L2 8.2z" />
    </svg>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/5 text-slate-500 hover:text-[#ff2d87] hover:border-[#ff2d87]/40 hover:bg-[#ff2d87]/10 transition-all"
    >
      {children}
    </a>
  );
}

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
          <span>
            © {new Date().getFullYear()} NetaGirifiles · built by{" "}
            <Link
              href="/about#builder"
              className="text-slate-300 hover:text-[#ff2d87] transition-colors"
            >
              Samrat
            </Link>
          </span>
          <div className="flex items-center gap-4">
            <nav className="flex gap-4">
              <Link href="/about" className="hover:text-slate-300">
                About
              </Link>
              <Link href="/disclaimer" className="hover:text-slate-300">
                Disclaimer
              </Link>
            </nav>
            <div className="flex items-center gap-1">
              <SocialIcon
                href="https://github.com/0xSamrat/netagiri-files"
                label="GitHub repo"
              >
                <GitHubIcon />
              </SocialIcon>
              <SocialIcon
                href="https://www.linkedin.com/in/samrat-mukherjee00/"
                label="LinkedIn"
              >
                <LinkedInIcon />
              </SocialIcon>
              <SocialIcon href="https://x.com/0x_samrat" label="X">
                <XIcon />
              </SocialIcon>
              <SocialIcon
                href="mailto:samrat.mukherjee2022@gmail.com"
                label="Email"
              >
                <MailIcon />
              </SocialIcon>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
