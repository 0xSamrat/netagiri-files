import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPoliticianById, listAllPoliticianIds } from "@/lib/queries/politicians";
import { ProfileHeader } from "@/components/politician/ProfileHeader";
import { CaseBreakdown } from "@/components/politician/CaseBreakdown";
import { ComparisonStats } from "@/components/politician/ComparisonStats";
import { ShareRow } from "@/components/ui/ShareRow";
import { SITE_URL } from "@/lib/share";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const ids = await listAllPoliticianIds();
  return ids.map((id) => ({ id: String(id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) return {};
  const p = await getPoliticianById(id);
  if (!p) return {};
  const title = `${p.name} — NetaGirifiles`;
  const description = `${p.name} (${p.party_short_name ?? "IND"}, ${p.constituency ?? p.state_name}) declared ${p.total_cases} case${p.total_cases !== 1 ? "s" : ""} in their ECI affidavit.`;
  const url = `${SITE_URL}/politician/${id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "NetaGirifiles",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PoliticianPage({ params }: PageProps) {
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) notFound();

  const politician = await getPoliticianById(id);
  if (!politician) notFound();

  const houseLabel = "Lok Sabha";
  const houseHref = "/lok-sabha";
  const canonical = `${SITE_URL}/politician/${politician.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: politician.name,
        url: canonical,
        jobTitle: "Member of Parliament, Lok Sabha",
        affiliation: politician.party_name
          ? { "@type": "Organization", name: politician.party_name }
          : undefined,
        address: politician.state_name
          ? {
              "@type": "PostalAddress",
              addressRegion: politician.state_name,
              addressCountry: "IN",
            }
          : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Lok Sabha",
            item: `${SITE_URL}/lok-sabha`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: politician.name,
            item: canonical,
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-2">
        <Link href="/" className="hover:text-[#ff2d87] transition-colors">
          Home
        </Link>
        <span className="text-slate-700">/</span>
        <Link href={houseHref} className="hover:text-[#ff2d87] transition-colors">
          {houseLabel}
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-300 truncate normal-case tracking-normal">
          {politician.name}
        </span>
      </nav>

      <ProfileHeader politician={politician} />

      <div className="rounded-2xl border border-white/5 bg-[#0b0f23]/60 backdrop-blur-md px-4 py-3">
        <ShareRow
          url={`${SITE_URL}/politician/${politician.id}`}
          title={`${politician.name} — NetaGirifiles`}
          text={[
            `⚖️ ${politician.name} (${politician.party_short_name ?? "IND"}${politician.constituency ? ` · ${politician.constituency}` : ""})`,
            `📄 Declared cases: ${politician.total_cases} · Serious: ${politician.serious_cases}`,
            `Source: ECI affidavit via NetaGirifiles`,
          ].join("\n")}
          label="Share this record"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CaseBreakdown
            cases={politician.cases}
            totalCases={politician.total_cases}
          />
        </div>
        <div>
          <ComparisonStats
            percentileParty={politician.percentile_party}
            percentileState={politician.percentile_state}
            percentileNational={politician.percentile_national}
            partyName={politician.party_name}
            stateName={politician.state_name}
            totalCases={politician.total_cases}
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center pt-2">
        Data sourced from self-sworn affidavits submitted to the Election
        Commission of India via{" "}
        <a
          href="https://myneta.info"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#ff2d87] transition-colors"
        >
          myneta.info (ADR)
        </a>
        . Cases are self-declared; acquittals and dismissals may not be
        reflected.
      </p>
    </div>
  );
}
