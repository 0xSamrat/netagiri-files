import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DialogueBubble } from "@/components/ui/DialogueBubble";
import { ShareFab } from "@/components/ui/ShareFab";
import { SITE_URL } from "@/lib/share";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#060814",
  width: "device-width",
  initialScale: 1,
};

const DESC =
  "Explore cases Indian MPs declared in their ECI election affidavits — by party, state, or individual. Source: myneta.info.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NetaGirifiles — The public record behind your MP",
    template: "%s · NetaGirifiles",
  },
  description: DESC,
  applicationName: "NetaGirifiles",
  keywords: [
    "Indian MPs",
    "Lok Sabha",
    "election affidavits",
    "MP criminal cases",
    "ECI affidavits",
    "myneta",
    "ADR",
    "civic transparency",
    "voter right to know",
    "Indian politicians",
  ],
  authors: [{ name: "Samrat Mukherjee", url: "https://github.com/0xSamrat" }],
  creator: "Samrat Mukherjee",
  publisher: "NetaGirifiles",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "NetaGirifiles — The public record behind your MP",
    description: DESC,
    siteName: "NetaGirifiles",
    type: "website",
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "NetaGirifiles — The public record behind your MP",
    description: DESC,
    creator: "@0x_samrat",
    site: "@0x_samrat",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  category: "news",
};

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NetaGirifiles",
  url: SITE_URL,
  description: DESC,
  inLanguage: "en-IN",
  publisher: {
    "@type": "Organization",
    name: "NetaGirifiles",
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/lok-sabha?party={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060814] text-slate-200">
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "wd56m3fs0v");`}
        </Script>
        <QueryProvider>
          <Header />
          <main
            className="flex-1 relative"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(255,45,135,0.06), transparent 70%)",
            }}
          >
            {children}
          </main>
          <Footer />
          <DialogueBubble />
          <ShareFab />
        </QueryProvider>
      </body>
    </html>
  );
}
