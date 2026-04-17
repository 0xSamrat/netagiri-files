import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NetaGirifiles — Track MP Criminal Records",
  description:
    "Civic transparency platform surfacing criminal cases declared by Indian MPs in their ECI election affidavits.",
  openGraph: {
    title: "NetaGirifiles — Track MP Criminal Records",
    description:
      "Explore criminal cases self-declared by Indian MPs in their ECI election affidavits.",
    siteName: "NetaGirifiles",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "NetaGirifiles — Track MP Criminal Records",
    description:
      "Explore criminal cases self-declared by Indian MPs in their ECI election affidavits.",
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
