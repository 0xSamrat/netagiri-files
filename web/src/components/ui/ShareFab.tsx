"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SITE_URL, buildShareLinks } from "@/lib/share";
import {
  FacebookIcon,
  LinkedInIcon,
  LinkIcon,
  ShareIcon,
  WhatsAppIcon,
  XIcon,
} from "./ShareIcons";

const ITEM_CLS =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0b0f23] text-slate-200 hover:text-white hover:border-[#ff2d87]/50 hover:bg-[#ff2d87]/15 hover:shadow-[0_0_14px_rgba(255,45,135,0.35)] transition-all";

function ItemBtn({
  href,
  onClick,
  label,
  children,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={ITEM_CLS}
    >
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={ITEM_CLS}>
      {children}
    </button>
  );
}

export function ShareFab() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const url = `${SITE_URL}${pathname}`;
  const title = "NetaGirifiles — The public record behind your elected MP";
  const text = [
    "⚖️ NetaGirifiles — cases Indian MPs declared in their election affidavits",
    "Explore by party, state, or individual. Source: ECI affidavits.",
  ].join("\n");
  const links = buildShareLinks({ url, title, text });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // noop
    }
  };

  return (
    <div
      ref={rootRef}
      className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-2"
    >
      {open && (
        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <ItemBtn href={links.whatsapp} label="Share on WhatsApp">
            <WhatsAppIcon />
          </ItemBtn>
          <ItemBtn href={links.x} label="Share on X">
            <XIcon />
          </ItemBtn>
          <ItemBtn href={links.facebook} label="Share on Facebook">
            <FacebookIcon />
          </ItemBtn>
          <ItemBtn href={links.linkedin} label="Share on LinkedIn">
            <LinkedInIcon />
          </ItemBtn>
          <ItemBtn onClick={copy} label="Copy link">
            <LinkIcon />
          </ItemBtn>
          {copied && (
            <span className="text-[10px] font-semibold text-[#ff2d87] bg-[#0b0f23] border border-[#ff2d87]/30 rounded-full px-2 py-0.5">
              Copied
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close share menu" : "Open share menu"}
        aria-expanded={open}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0b0f23] border border-[#ff2d87]/40 text-[#ff2d87] shadow-[0_0_24px_rgba(255,45,135,0.35)] hover:bg-[#ff2d87]/10 transition-colors"
      >
        {open ? (
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <ShareIcon width={20} height={20} />
        )}
      </button>
    </div>
  );
}
