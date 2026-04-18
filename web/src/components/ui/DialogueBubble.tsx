"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DIALOGUES } from "@/data/dialogues";
import { getDialogueUrl, pickRandomDialogue } from "@/lib/dialogues";
import type { Dialogue } from "@/data/dialogues";

type PlayState = "idle" | "playing" | "paused";

export function DialogueBubble() {
  const [current, setCurrent] = useState<Dialogue | null>(null);
  const [state, setState] = useState<PlayState>("idle");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastIdRef = useRef<string | undefined>(undefined);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "none";
      el.addEventListener("timeupdate", () => {
        setProgress(el.currentTime);
      });
      el.addEventListener("loadedmetadata", () => {
        setDuration(el.duration || 0);
      });
      el.addEventListener("ended", () => {
        setState("idle");
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = setTimeout(() => setToastVisible(false), 800);
      });
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  const playRandom = useCallback(() => {
    const pick = pickRandomDialogue(lastIdRef.current);
    if (!pick) return;
    lastIdRef.current = pick.id;

    const el = ensureAudio();
    el.pause();
    el.src = getDialogueUrl(pick.file);
    el.currentTime = 0;
    setCurrent(pick);
    setProgress(0);
    setDuration(pick.durationSec || 0);
    setToastVisible(true);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    el.play()
      .then(() => setState("playing"))
      .catch(() => setState("idle"));
  }, [ensureAudio]);

  const handleClick = useCallback(() => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      return;
    }
    playRandom();
  }, [state, playRandom]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setToastVisible(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  if (DIALOGUES.length === 0) return null;

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;
  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed right-4 sm:right-6 z-50 flex flex-col items-end gap-3 max-w-[calc(100vw-2rem)]"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      {toastVisible && current && (
        <div
          role="status"
          aria-live="polite"
          className="w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/5 bg-[#0b0f23]/95 backdrop-blur-md p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#ff2d87] font-semibold mb-1">
            Famous parliamentary dialogue
          </div>
          <p className="text-[13px] text-slate-200 leading-snug mb-3 line-clamp-3">
            &ldquo;{current.quote}&rdquo;
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-[#ff2d87] transition-[width] duration-100 ease-linear"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-slate-500">
              {fmt(progress)} / {fmt(duration)}
            </span>
          </div>
          <div className="mt-2 text-[9px] italic text-slate-500">
            Public-speech clip · used as commentary
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        aria-label="Play a random famous parliamentary dialogue"
        className="group relative h-14 w-14 rounded-full border border-[#ff2d87]/40 bg-[#0b0f23] shadow-[0_0_24px_rgba(255,45,135,0.35)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d87] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060814] motion-safe:animate-[pulse_3s_ease-in-out_infinite]"
      >
        <span className="absolute inset-0 rounded-full bg-[#ff2d87]/10 motion-safe:animate-ping motion-reduce:hidden" />
        <span className="relative flex items-center justify-center h-full w-full text-[#ff2d87]">
          {state === "playing" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 11l18-8v18l-18-8v-2z" />
              <path d="M11 11v4" />
            </svg>
          )}
        </span>
        <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#0b0f23] border border-white/5 px-2 py-1 text-[11px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          Hear them speak
        </span>
      </button>
    </div>
  );
}
