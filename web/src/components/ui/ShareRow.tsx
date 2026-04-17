"use client";

import { useState } from "react";
import { buildShareLinks } from "@/lib/share";
import {
  FacebookIcon,
  LinkedInIcon,
  LinkIcon,
  WhatsAppIcon,
  XIcon,
} from "./ShareIcons";

interface Props {
  url: string;
  title: string;
  text?: string;
  label?: string;
}

const CHIP_CLS =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:border-[#ff2d87]/40 hover:bg-[#ff2d87]/10 hover:shadow-[0_0_12px_rgba(255,45,135,0.25)] transition-all";

function Chip({
  href,
  onClick,
  children,
  title: t,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t}
      title={t}
      className={CHIP_CLS}
    >
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={t} title={t} className={CHIP_CLS}>
      {children}
    </button>
  );
}

export function ShareRow({ url, title, text, label = "Share" }: Props) {
  const [copied, setCopied] = useState(false);
  const links = buildShareLinks({ url, title, text });

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
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <Chip href={links.whatsapp} title="Share on WhatsApp">
          <WhatsAppIcon />
        </Chip>
        <Chip href={links.x} title="Share on X">
          <XIcon />
        </Chip>
        <Chip href={links.facebook} title="Share on Facebook">
          <FacebookIcon />
        </Chip>
        <Chip href={links.linkedin} title="Share on LinkedIn">
          <LinkedInIcon />
        </Chip>
        <Chip onClick={copy} title="Copy link">
          <LinkIcon />
        </Chip>
      </div>
      {copied && (
        <span className="text-[11px] text-[#ff2d87] font-semibold">
          Link copied
        </span>
      )}
    </div>
  );
}
