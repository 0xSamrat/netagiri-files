import { DIALOGUES, type Dialogue } from "@/data/dialogues";

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ?? "";

export function getDialogueUrl(file: string): string {
  if (!STORAGE_URL) return "";
  return `${STORAGE_URL.replace(/\/$/, "")}/${file}`;
}

/** Shuffle-bag: plays every clip once before reshuffling. */
let bag: Dialogue[] = [];

function refillBag(): void {
  bag = [...DIALOGUES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
}

export function pickRandomDialogue(_excludeId?: string): Dialogue | null {
  if (DIALOGUES.length === 0) return null;
  if (bag.length === 0) refillBag();
  return bag.pop()!;
}
