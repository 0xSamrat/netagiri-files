import { DIALOGUES, type Dialogue } from "@/data/dialogues";

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ?? "";

export function getDialogueUrl(file: string): string {
  if (!STORAGE_URL) return "";
  return `${STORAGE_URL.replace(/\/$/, "")}/${file}`;
}

export function pickRandomDialogue(excludeId?: string): Dialogue | null {
  if (DIALOGUES.length === 0) return null;
  if (DIALOGUES.length === 1) return DIALOGUES[0];
  const pool = excludeId
    ? DIALOGUES.filter((d) => d.id !== excludeId)
    : DIALOGUES;
  return pool[Math.floor(Math.random() * pool.length)];
}
