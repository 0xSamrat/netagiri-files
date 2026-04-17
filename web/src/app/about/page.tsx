import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — NetaGirifiles",
  description:
    "Why NetaGirifiles exists, how it works, where the data comes from, and the constitutional basis for the voter's right to know.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 text-slate-300 leading-relaxed">
      <header className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#ff2d87] font-semibold">
          About
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          A civic-transparency lens on India&apos;s Parliament.
        </h1>
        <p className="text-slate-400">
          NetaGirifiles is a non-partisan, non-profit project that makes the
          criminal-case declarations of elected Members of Parliament easy to
          read, search, and share. Every number on this site traces back to an
          affidavit a candidate swore before the Election Commission of India.
        </p>
      </header>

      <section id="builder" className="space-y-4 scroll-mt-20">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Who built this?
        </h2>
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0b0f23] to-[#080b1d] p-5 sm:p-6 space-y-5 text-[15px] leading-relaxed">
          <div
            className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,45,135,0.22) 0%, rgba(255,45,135,0) 70%)",
            }}
          />

          <div className="relative flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-[#ff2d87]/15 border border-[#ff2d87]/30 items-center justify-center text-2xl shrink-0">
              👋
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                Hey, I&apos;m Samrat.
              </p>
              <p className="text-slate-400 text-sm">
                Software engineer. Civic-data nerd. Built this site on a
                stubborn Sunday.
              </p>
            </div>
          </div>

          <p className="relative">
            I wanted to look up my own MP&apos;s declared affidavit data and
            bounced off three clunky PDFs before giving up. So I did what
            engineers do when they&apos;re annoyed — I built the thing I
            wished existed.
          </p>

          <p className="relative">
            <span className="text-white font-semibold">NetaGirifiles</span> is
            a Next.js + Postgres + D3 + Go-scraper app: around ~800
            pre-rendered MP pages, a bubble chart that sulks on mobile but
            works, a map, dynamic OG images, and an audio easter egg with
            famous parliamentary dialogues. All open source, all drawn from
            public records. No ads, no data sold to anyone, no political leanings — just lightweight analytics so I know what&apos;s working.
          </p>

          <div className="relative rounded-xl border border-[#ff2d87]/25 bg-[#ff2d87]/5 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#ff2d87] font-bold mb-1">
              PS — I&apos;m looking for my next role
            </div>
            <p className="text-slate-200 text-[14px]">
              If your team is hiring engineers who{" "}
              <span className="text-white font-semibold">ship</span>, care
              about <span className="text-white font-semibold">craft</span>,
              and take{" "}
              <span className="text-white font-semibold">public-interest work</span>{" "}
              seriously — this whole site is basically my portfolio. Full-time,
              contract, interesting weird thing — I&apos;m listening. The four
              buttons below all reach me.
            </p>
          </div>

          <div className="relative flex flex-wrap gap-2 pt-1">
            <BuilderLink
              href="mailto:samrat.mukherjee2022@gmail.com"
              label="📬 Email me"
            />
            <BuilderLink
              href="https://www.linkedin.com/in/samrat-mukherjee00/"
              label="LinkedIn"
            />
            <BuilderLink
              href="https://github.com/0xSamrat/netagiri-files"
              label="GitHub (this repo)"
            />
            <BuilderLink href="https://x.com/0x_samrat" label="X / Twitter" />
          </div>
        </div>
      </section>

      <Section title="What this site does">
        <p>
          Under the Representation of the People Act, 1951 and directions of
          the Supreme Court, every candidate contesting an Indian election must
          file a sworn affidavit (Form 26) disclosing pending criminal cases,
          prior convictions, assets, liabilities, and educational background.
          These affidavits are public documents.
        </p>
        <p>
          NetaGirifiles aggregates the subset of this data that relates to{" "}
          <span className="text-white font-semibold">criminal cases</span> of
          sitting Lok Sabha MPs, reorganizes it by party, state, and
          individual, and presents it in a readable, visual form. We do not
          add, interpret, or editorialize the underlying declarations — we only
          make them easier to see.
        </p>
      </Section>

      <Section title="The voter's right to know">
        <p>
          The constitutional basis for this project is the Indian voter&apos;s
          right to know, which the Supreme Court of India has consistently
          recognized as a component of the fundamental right to freedom of
          speech and expression under{" "}
          <span className="text-white">Article 19(1)(a)</span> of the
          Constitution.
        </p>
        <ul className="space-y-3 pl-1">
          <Case
            cite="Union of India v. Association for Democratic Reforms (2002) 5 SCC 294"
            body="The Supreme Court held that voters have a fundamental right to know the antecedents of candidates contesting elections, including pending criminal cases, assets, and educational qualifications."
          />
          <Case
            cite="People's Union for Civil Liberties v. Union of India (2003) 4 SCC 399"
            body="Reaffirmed that the right to information about public figures seeking elected office flows directly from Article 19(1)(a) and cannot be curtailed by ordinary legislation."
          />
          <Case
            cite="Public Interest Foundation v. Union of India (2019) 3 SCC 224"
            body="Directed political parties to publish the criminal antecedents of their candidates on their websites and in widely-circulated newspapers."
          />
          <Case
            cite="Rambabu Singh Thakur v. Sunil Arora (2020) 3 SCC 733"
            body="Mandated that parties disclose, within 48 hours of candidate selection, the criminal record of each candidate along with the reasons for selecting them."
          />
        </ul>
        <p>
          NetaGirifiles is a good-faith exercise of that right — a tool to help
          citizens access information that courts have repeatedly held they are
          constitutionally entitled to see.
        </p>
      </Section>

      <Section title="Where the data comes from">
        <p>
          The source of every case count, IPC section, and candidate detail on
          this site is{" "}
          <a
            href="https://myneta.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff2d87] hover:text-white underline underline-offset-2"
          >
            myneta.info
          </a>
          , a public database maintained by the{" "}
          <span className="text-white">
            Association for Democratic Reforms (ADR)
          </span>{" "}
          and National Election Watch. ADR is a registered non-profit that has
          been compiling candidate affidavits filed with the Election
          Commission of India since 2002, and its data is routinely cited by
          courts, journalists, and election monitors.
        </p>
        <p>
          We do not scrape the Election Commission directly; we rely on
          myneta.info&apos;s structured, human-verified archive. Corrections
          and updates that flow into their archive flow into ours.
        </p>
      </Section>

      <Section title="How the site is built">
        <p>
          NetaGirifiles is open tooling over open data. Parts of the source
          code, interface copy, and design of this application were written or
          refined with the assistance of{" "}
          <span className="text-white">generative AI</span> tools. The editorial
          decisions — which data to surface, how to classify cases, what
          disclaimers to attach — remain human. No AI model is used to{" "}
          <em>generate</em> case records, quotations, or accusations. The data
          you see here is exactly what the candidate themselves declared on
          oath.
        </p>
      </Section>

      <Section title="A note on fairness">
        <p>
          Every figure on this site reflects{" "}
          <span className="text-white">pending declarations</span>, not
          convictions. Under Indian law, an accused person is presumed innocent
          until proven guilty in a court of competent jurisdiction. A pending
          case may be politically motivated, eventually dismissed, or settled.
          None of the MPs listed here have been adjudged guilty by this site
          simply by appearing in it.
        </p>
        <p>
          We treat this distinction seriously. The phrasing, color palette, and
          framing across NetaGirifiles are intended to inform, not to accuse.
        </p>
      </Section>

      <Section title="Legal position">
        <p>
          This site republishes public-record information that candidates
          themselves filed on sworn affidavit with a constitutional authority.
          It falls squarely within the protection of fair comment and reporting
          on matters of public interest, and within the voter&apos;s right to
          know as affirmed by the Supreme Court of India.
        </p>
        <p>
          NetaGirifiles does not assert the truth of any allegation in an
          affidavit beyond the undisputed fact that the candidate themselves
          declared it. No statement on this site goes beyond what is already in
          the public record at{" "}
          <a
            href="https://myneta.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff2d87] hover:text-white underline underline-offset-2"
          >
            myneta.info
          </a>{" "}
          and in the Election Commission&apos;s archives.
        </p>
        <p>
          If any individual believes a specific entry is factually incorrect —
          for instance, a case has since been quashed, or the underlying
          affidavit has been amended — we will review and update the record on
          receipt of the relevant document. Requests for takedown that are not
          supported by a documented factual error will be declined, as the
          underlying data remains a matter of public record.
        </p>
      </Section>

      <Section title="Corrections and contact">
        <p>
          Spot something inaccurate? Want to flag a record that has been
          updated at source? Please reach out. We aim to respond to good-faith
          correction requests within a reasonable time and to acknowledge
          corrections publicly.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/disclaimer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 text-white text-xs font-semibold px-4 py-2 hover:bg-white/10 transition-colors"
          >
            Read the full disclaimer
          </Link>
          <a
            href="https://myneta.info"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#ff2d87]/30 bg-[#ff2d87]/10 text-[#ff2d87] text-xs font-semibold px-4 py-2 hover:bg-[#ff2d87]/20 transition-colors"
          >
            Primary source: myneta.info →
          </a>
        </div>
      </Section>

      <p className="text-xs text-slate-500 border-t border-white/5 pt-6">
        NetaGirifiles is a volunteer-run civic-transparency project and is not
        affiliated with any political party, candidate, the Election Commission
        of India, or the Association for Democratic Reforms. Brand and party
        names are used purely for identification under nominative fair use.
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
      <div className="space-y-3 text-sm sm:text-[15px]">{children}</div>
    </section>
  );
}

function BuilderLink({ href, label }: { href: string; label: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] text-slate-200 text-xs font-semibold px-3.5 py-1.5 hover:text-white hover:border-[#ff2d87]/40 hover:bg-[#ff2d87]/10 transition-colors"
    >
      {label}
      <span aria-hidden>→</span>
    </a>
  );
}

function Case({ cite, body }: { cite: string; body: string }) {
  return (
    <li className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#ff2d87] font-semibold">
        {cite}
      </div>
      <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{body}</p>
    </li>
  );
}
