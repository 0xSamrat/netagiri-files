import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DialogueBubble } from "@/components/ui/DialogueBubble";
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
  title: "NetaGirifiles — Track MP Criminal Records",
  description:
    "Civic transparency platform surfacing criminal cases declared by Indian MPs in their ECI election affidavits.",
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
        </QueryProvider>
      </body>
    </html>
  );
}
