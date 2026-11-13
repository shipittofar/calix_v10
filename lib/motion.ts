/**
 * When the home-page scroll sequence (S1) runs as a sticky plate. Used by the
 * pre-paint script in app/layout.tsx and by SequenceController. Below this, or
 * with reduced motion, the static layout is shown (docs/scroll-narrative.md §6.4).
 */
export const SEQUENCE_MOTION_QUERY =
  "(min-width: 1200px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";

/**
 * When the olive story (components/home/story) runs as a pinned, scroll-scrubbed stage. Unlike S1
 * it also runs on phones, which get their own camera framing; very short landscape viewports keep
 * the static layout.
 */
export const STORY_MOTION_QUERY = "(min-height: 480px) and (prefers-reduced-motion: no-preference)";

/**
 * The pre-paint script in app/layout.tsx: chooses the scroll-sequence layouts before first paint.
 * Kept here so its exact text can be hashed for a script-src CSP (proxy.ts).
 */
export const MOTION_BOOT_SCRIPT = `try{var d=document.documentElement;if(matchMedia(${JSON.stringify(SEQUENCE_MOTION_QUERY)}).matches)d.dataset.motion="on";if(matchMedia(${JSON.stringify(STORY_MOTION_QUERY)}).matches)d.dataset.story="on"}catch(e){}`;
