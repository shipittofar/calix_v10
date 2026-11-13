/**
 * The story's timeline: each beat is a distinct, visible state of the drawing in plate.ts,
 * grouped into the eight chapters of stages.ts. A beat's label is shown as the "now" line in the
 * caption during playback, and listed as the chapter's steps in the static layout.
 *
 * The story is conceptual: how a brand is built, from one point (the idea) to a whole system seen
 * everywhere. Durations are in timeline units (about three quarters of a viewport of scrolling
 * each; see the CSS), so one wheel notch moves the story by about half a beat.
 */

type BeatSpec = readonly [id: string, label: string, duration: number];

const CHAPTERS: readonly (readonly BeatSpec[])[] = [
  // 1. The idea
  [
    ["a1", "A blank ground.", 0.4],
    ["a2", "A single point: the idea.", 0.35],
    ["a3", "It takes a direction.", 0.3],
    ["a4", "A circle around it: what it holds.", 0.35],
  ],
  // 2. Strategy
  [
    ["b1", "Who it is for.", 0.3],
    ["b2", "What it promises.", 0.3],
    ["b3", "Why it matters.", 0.3],
    ["b4", "How people will find it.", 0.3],
    ["b5", "Four answers, one direction.", 0.4],
  ],
  // 3. The mark
  [
    ["c1", "A drawing board rises.", 0.35],
    ["c2", "Construction lines: square and circle.", 0.35],
    ["c3", "The circle becomes an arch.", 0.3],
    ["c4", "The mark resolves.", 0.35],
    ["c5", "It is given depth.", 0.35],
  ],
  // 4. Colour and type
  [
    ["d1", "A first colour.", 0.3],
    ["d2", "A second, to work beside it.", 0.25],
    ["d3", "An accent, used sparingly.", 0.25],
    ["d4", "Two grounds to set it on.", 0.3],
    ["d5", "A typeface for headlines.", 0.3],
    ["d6", "And one for everything else.", 0.3],
  ],
  // 5. The system
  [
    ["e1", "A grid beneath every piece.", 0.35],
    ["e2", "Each piece finds its place.", 0.4],
    ["e3", "Measured spacing.", 0.3],
    ["e4", "A voice: few words, chosen well.", 0.35],
    ["e5", "One system.", 0.35],
  ],
  // 6. Applications
  [
    ["f1", "A website, built on the system.", 0.4],
    ["f2", "Found in search and in AI answers.", 0.35],
    ["f3", "Content, page after page.", 0.3],
    ["f4", "Print.", 0.3],
    ["f5", "A sign on the street.", 0.3],
    ["f6", "Social, post by post.", 0.3],
  ],
  // 7. Presented
  [
    ["g1", "Brought together.", 0.35],
    ["g2", "Every piece traced back to one point.", 0.4],
    ["g3", "Presented as one.", 0.35],
    ["g4", "Recognised at a glance.", 0.35],
  ],
  // 8. The ecosystem
  [
    ["h1", "Stepping back.", 0.35],
    ["h2", "It travels.", 0.35],
    ["h3", "Further.", 0.35],
    ["h4", "Wherever people meet it.", 0.4],
    ["h5", "A whole brand, from one point.", 0.6],
  ],
];

export type Beat = { id: string; label: string; chapter: number; start: number; end: number };

export const BEATS: readonly Beat[] = (() => {
  const out: Beat[] = [];
  let at = 0;
  CHAPTERS.forEach((beats, chapter) =>
    beats.forEach(([id, label, d]) => {
      out.push({ id, label, chapter, start: at, end: at + d });
      at += d;
    }),
  );
  return out;
})();

export const TOTAL = BEATS[BEATS.length - 1].end;

const byId = new Map(BEATS.map((b) => [b.id, b]));
export const beat = (id: string) => {
  const b = byId.get(id);
  if (!b) throw new Error(`Unknown beat ${id}`);
  return b;
};

/** Each chapter's span on the timeline. */
export const CHAPTER_SPANS: readonly [number, number][] = CHAPTERS.map((_, c) => {
  const own = BEATS.filter((b) => b.chapter === c);
  return [own[0].start, own[own.length - 1].end];
});

/** The beat on screen at t. */
export const beatAt = (t: number) => BEATS.find((b) => t < b.end) ?? BEATS[BEATS.length - 1];

/** Step labels per chapter, for the static layout. */
export const stepsFor = (chapter: number) => BEATS.filter((b) => b.chapter === chapter).map((b) => b.label);

/** Smooth step, clamped. */
export const smooth = (a: number, b: number, x: number) => {
  if (b <= a) return x >= b ? 1 : 0;
  const k = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return k * k * (3 - 2 * k);
};

/** Linear progress, clamped. */
export const linear = (a: number, b: number, x: number) => (b <= a ? (x >= b ? 1 : 0) : Math.min(Math.max((x - a) / (b - a), 0), 1));

/**
 * Progress (0–1) of a beat, or of a run of beats from `from` to `to`. Actions fill the middle of
 * their beat (10%–90%), so each beat begins and ends on a readable, still state.
 */
export const progress = (t: number, from: string, to = from, ease = true) => {
  const a = beat(from);
  const b = beat(to);
  const s = a.start + (a.end - a.start) * 0.1;
  const e = b.end - (b.end - b.start) * 0.1;
  return ease ? smooth(s, e, t) : linear(s, e, t);
};

/** Piecewise-linear value through [beatId, value] points, each at the end of its beat. */
export const through = (t: number, points: readonly (readonly [string, number])[]) => {
  const xs = points.map(([id]) => beat(id).end);
  if (t <= xs[0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (t <= xs[i]) {
      const k = smooth(xs[i - 1], xs[i], t);
      return points[i - 1][1] + (points[i][1] - points[i - 1][1]) * k;
    }
  }
  return points[points.length - 1][1];
};
