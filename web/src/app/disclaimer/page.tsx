import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer — NetaGirifiles",
  description:
    "Legal disclaimer, data source, scope of information, presumption of innocence, and corrections policy for NetaGirifiles.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 text-slate-300 leading-relaxed">
      <header className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#ff2d87] font-semibold">
          Disclaimer
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          Read this before interpreting any number on this site.
        </h1>
        <p className="text-slate-400">
          NetaGirifiles is a civic-transparency project that republishes
          information from public election affidavits. The disclaimers below
          govern every page, chart, and data point on this site.
        </p>
      </header>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-100/90 leading-relaxed">
        <strong className="text-amber-200 block mb-1">
          Important — please read first
        </strong>
        Every figure on this site reflects{" "}
        <span className="text-white font-semibold">self-declared pending cases</span>
        , not convictions. An accused person is presumed innocent under Indian
        law until proven guilty by a court of competent jurisdiction. Pending
        cases may ultimately be dismissed, quashed, or acquitted.
      </div>

      <Section title="1. Nature of information">
        <p>
          All information displayed on NetaGirifiles is sourced directly from
          affidavits self-declared by candidates and submitted to the Election
          Commission of India (ECI) under Section 33A of the Representation of
          the People Act, 1951, as compiled and published by{" "}
          <a
            href="https://myneta.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff2d87] hover:text-white underline underline-offset-2"
          >
            myneta.info
          </a>{" "}
          (Association for Democratic Reforms / National Election Watch).
        </p>
        <p>
          NetaGirifiles does not conduct its own investigations, does not
          independently verify the underlying affidavits, and does not add
          factual claims beyond what a candidate themselves filed on oath with
          a constitutional authority.
        </p>
      </Section>

      <Section title="2. Declarations, not convictions">
        <p>
          The phrase &ldquo;criminal cases&rdquo; on this site refers to{" "}
          <span className="text-white">pending</span> cases as declared by the
          candidate at the time of filing. It does not mean the individual has
          been found guilty of any offence.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
          <li>Some cases may be politically motivated.</li>
          <li>Some may have been stayed, quashed, or withdrawn after the affidavit was filed.</li>
          <li>Some may have resulted in acquittal after trial.</li>
          <li>Some may have been compounded or settled.</li>
        </ul>
        <p>
          Users are encouraged to consult primary court records before drawing
          any conclusion about an individual.
        </p>
      </Section>

      <Section title="3. No defamatory intent">
        <p>
          NetaGirifiles is published in good faith, in the public interest, and
          solely to facilitate the voter&apos;s right to know — a right
          affirmed by the Supreme Court of India in{" "}
          <em>Union of India v. Association for Democratic Reforms</em>{" "}
          (2002) and subsequent decisions as flowing from Article 19(1)(a) of
          the Constitution.
        </p>
        <p>
          No content on this site is intended to allege guilt, cast aspersions
          beyond what is in the public record, or injure the reputation of any
          individual. Where language on the site characterizes a case (e.g.
          &ldquo;serious&rdquo;), that characterization is based on the
          classification used by ADR / National Election Watch in their public
          reports.
        </p>
      </Section>

      <Section title="4. Accuracy and timeliness">
        <p>
          While we aim to reflect the myneta.info dataset accurately, data on
          this site may be:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
          <li>Stale relative to the source (updates propagate on a periodic refresh).</li>
          <li>Incomplete for candidates whose affidavits are missing or unreadable.</li>
          <li>Subject to transcription differences between the original affidavit and the ADR compilation.</li>
        </ul>
        <p>
          In case of any discrepancy, the primary affidavit filed with the
          Election Commission of India shall prevail.
        </p>
      </Section>

      <Section title="5. Not legal, electoral, or professional advice">
        <p>
          Nothing on NetaGirifiles constitutes legal, electoral, or
          professional advice. The site is informational only. Users relying on
          any figure for legal proceedings, journalism, academic work, or
          election-related decision-making are expected to independently verify
          the underlying affidavit from the ECI or myneta.info.
        </p>
      </Section>

      <Section title="6. Third-party content and links">
        <p>
          This site links to external resources, including myneta.info and
          individual news articles. We are not responsible for the content,
          accuracy, or privacy practices of third-party sites. External links
          are provided for context and do not imply endorsement.
        </p>
      </Section>

      <Section title="7. AI-assisted tooling">
        <p>
          Portions of this site&apos;s source code, interface text, and design
          were produced with the assistance of generative AI tools. AI is not
          used to produce, infer, or fabricate the underlying case data —
          every case record, party label, and count on this site is drawn from
          human-compiled affidavit data.
        </p>
      </Section>

      <Section title="8. Analytics and privacy">
        <p>
          This site uses{" "}
          <a
            href="https://clarity.microsoft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff2d87] hover:text-white underline underline-offset-2"
          >
            Microsoft Clarity
          </a>{" "}
          to understand how visitors use the interface — which pages are
          viewed, how far people scroll, and where they click. Clarity may
          record session interactions (mouse movement, clicks, scroll) in an
          aggregated, privacy-friendly form, and may use cookies and similar
          technologies for this purpose. The collected data is subject to
          Microsoft&apos;s privacy terms.
        </p>
        <p>
          We do not sell, share, or commercialize this data, and we do not run
          advertising on this site. Analytics are used solely to improve the
          usability of NetaGirifiles. If you prefer not to be included, most
          browsers let you block analytics scripts through privacy settings or
          standard content-blocker extensions.
        </p>
      </Section>

      <Section title="9. Non-affiliation">
        <p>
          NetaGirifiles is an independent, non-partisan civic project. It is
          not affiliated with, endorsed by, or funded by any political party,
          candidate, the Election Commission of India, the Association for
          Democratic Reforms, or the Government of India. Party names, logos,
          and colours are used solely for identification purposes under
          nominative fair use.
        </p>
      </Section>

      <Section title="10. Corrections and takedown">
        <p>
          If you are a named individual or an authorized representative and
          believe a specific entry on this site is factually inaccurate — for
          example, a case has since been quashed, the affidavit has been
          amended, or the underlying myneta.info entry has been corrected — we
          will review and update the record on receipt of the relevant
          document (court order, corrected affidavit, or an updated
          myneta.info URL).
        </p>
        <p>
          Requests for takedown that are{" "}
          <span className="text-white">
            not supported by a documented factual error
          </span>{" "}
          will be declined, as the underlying affidavits remain a matter of
          public record and their dissemination is protected speech under
          Article 19(1)(a) of the Constitution of India.
        </p>
      </Section>

      <Section title="11. Governing law and jurisdiction">
        <p>
          This disclaimer and any disputes arising out of or in connection
          with the use of NetaGirifiles shall be governed by and construed in
          accordance with the laws of the Republic of India. The courts at{" "}
          <span className="text-white">Kolkata, West Bengal</span> shall have
          exclusive jurisdiction over any such dispute, subject to the
          applicable rules on personal jurisdiction and cause of action.
        </p>
      </Section>

      <Section title="12. Liability">
        <p>
          NetaGirifiles is a volunteer project offered &ldquo;as is&rdquo;
          without warranty of any kind. To the maximum extent permitted by
          law, the operators of this site disclaim any liability for loss or
          damage arising from use of, or reliance on, information presented
          here. Use of this site indicates acceptance of this disclaimer.
        </p>
      </Section>

      <div className="rounded-2xl border border-white/5 bg-[#0b0f23]/60 backdrop-blur-md p-5 space-y-3">
        <h3 className="text-white font-semibold">
          For corrections or legal notices
        </h3>
        <p className="text-sm text-slate-400">
          Email:{" "}
          <a
            href="mailto:samrat.mukherjee2022@gmail.com"
            className="text-[#ff2d87] hover:text-white underline underline-offset-2"
          >
            samrat.mukherjee2022@gmail.com
          </a>
          . Additional channels are listed on our{" "}
          <Link
            href="/about"
            className="text-[#ff2d87] hover:text-white underline underline-offset-2"
          >
            About page
          </Link>
          . Good-faith, documented correction requests are typically reviewed
          within a reasonable time and acknowledged publicly once acted upon.
        </p>
      </div>

      <p className="text-xs text-slate-500 border-t border-white/5 pt-6">
        Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        . This disclaimer may be revised; the version shown here governs the
        site as of the date above.
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
