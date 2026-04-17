export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.netagirifiles.fun";

export interface ShareTarget {
  url: string;
  title: string;
  text?: string;
}

export function buildShareLinks({ url, title, text }: ShareTarget) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const body = encodeURIComponent(text ?? title);
  return {
    whatsapp: `https://api.whatsapp.com/send?text=${body}%20${u}`,
    x: `https://twitter.com/intent/tweet?text=${body}&url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}&title=${t}`,
  };
}
