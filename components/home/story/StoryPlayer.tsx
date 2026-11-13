"use client";

import { useEffect } from "react";
import { STORY_MOTION_QUERY } from "@/lib/motion";
import { CHAPTER_SPANS, TOTAL, beat, beatAt, smooth } from "./beats";
import { drawPlate, type Fonts, type Rect } from "./plate";
import { DISCIPLINE_BEATS } from "./stages";

/** How quickly the picture follows the scroll position (seconds). Small enough to stay attached. */
const FOLLOW = 0.09;
/** Caption fades, in timeline units. */
const CAPTION_FADE = 0.2;

/**
 * Plays the story in its pinned stage: the construction drawing (plate.ts) on a 2D canvas beside
 * the chapter's caption with the current step. Everything is a function of the timeline position,
 * which follows the scroll position. Only active when STORY_MOTION_QUERY matches; otherwise
 * data-story is removed, the static stages remain, and each gets a still of its last step.
 *
 * Rendering is event-driven: it updates on scroll and resize, follows the scroll position briefly,
 * then stops. Nothing runs while the section is off screen.
 */
export function StoryPlayer() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-story-root]");
    if (!root) return;
    const html = document.documentElement;
    const mq = window.matchMedia(STORY_MOTION_QUERY);
    let teardown: (() => void) | null = null;

    const onChange = () => {
      teardown?.();
      teardown = null;
      if (!mq.matches) {
        delete html.dataset.story;
        teardown = mountStills(root);
        return;
      }
      html.dataset.story = "on";
      teardown = mount(root);
      if (!teardown) {
        delete html.dataset.story;
        teardown = mountStills(root);
      }
    };

    onChange();
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      teardown?.();
      delete html.dataset.story;
    };
  }, []);

  return null;
}

const fontsOf = (root: HTMLElement): Fonts => ({
  text: getComputedStyle(document.body).fontFamily,
  display: getComputedStyle(root.querySelector("h2") ?? document.body).fontFamily,
});

/** Static layout: one still per stage, at the end of its last step. */
function mountStills(root: HTMLElement) {
  const slots = Array.from(root.querySelectorAll<HTMLElement>("[data-still]"));
  const canvases = slots.map((slot) => {
    const canvas = document.createElement("canvas");
    canvas.className = "story__still-canvas";
    slot.append(canvas);
    slot.classList.add("is-drawn");
    return canvas;
  });
  const draw = () => {
    const fonts = fontsOf(root);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvases.forEach((canvas, i) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx || !w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const t = CHAPTER_SPANS[i][1] - 0.001;
      drawPlate(ctx, { t, rect: { x: 0, y: 0, w, h }, dpr, fonts, canvasW: canvas.width, canvasH: canvas.height });
    });
  };
  const ro = new ResizeObserver(draw);
  slots.forEach((slot) => ro.observe(slot));
  document.fonts?.ready.then(draw);
  draw();
  return () => {
    ro.disconnect();
    canvases.forEach((c) => c.remove());
    slots.forEach((slot) => slot.classList.remove("is-drawn"));
  };
}

type Layout = { panel: Rect; drawing: Rect };

/** Landscape: drawing on the left, caption in a column on the right. Portrait: drawing above the caption. */
function layout(w: number, h: number): Layout {
  if (w >= 820 && w >= h * 1.05) {
    const m = Math.min(56, Math.max(24, w * 0.035));
    const cw = Math.min(440, w * 0.32);
    const x = w - m - cw;
    const y = Math.max(m, h * 0.2);
    return { panel: { x, y, w: cw, h: h - y - m }, drawing: { x: 0, y: 0, w: x - m * 0.5, h } };
  }
  const m = 16;
  const panelH = Math.min(240, h * 0.34);
  const panel = { x: m, y: h - panelH - 12, w: w - 2 * m, h: panelH };
  return { panel, drawing: { x: 0, y: 0, w, h: panel.y - 8 } };
}

function mount(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>(".story__track");
  const stage = root.querySelector<HTMLElement>(".story__stage");
  const captions = Array.from(root.querySelectorAll<HTMLElement>("[data-caption]"));
  const nowLines = captions.map((c) => c.querySelector<HTMLElement>(".story__now"));
  const disciplines = Array.from(root.querySelectorAll<HTMLElement>("[data-discipline]"));
  const rule = root.querySelector<HTMLElement>(".story__progress-rule");
  if (!track || !stage || !rule) return null;

  const canvas = document.createElement("canvas");
  canvas.className = "story__canvas";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  stage.prepend(canvas);

  let fonts = fontsOf(root);

  // ---------- Size and layout ----------
  let dpr = 1;
  let lay = layout(1, 1);
  let drawRect: Rect = { x: 0, y: 0, w: 1, h: 1 };
  const resize = () => {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    lay = layout(W, H);
    // The canvas covers only the drawing's area, not the whole stage: every frame's canvas is
    // rasterized and handed to the compositor, at a cost that grows with its size.
    const d = lay.drawing;
    canvas.width = Math.round(d.w * dpr);
    canvas.height = Math.round(d.h * dpr);
    drawRect = { x: 0, y: 0, w: d.w, h: d.h };
    stage.style.setProperty("--draw-x", `${d.x}px`);
    stage.style.setProperty("--draw-y", `${d.y}px`);
    stage.style.setProperty("--draw-w", `${d.w}px`);
    stage.style.setProperty("--draw-h", `${d.h}px`);
    const p = lay.panel;
    stage.style.setProperty("--panel-x", `${p.x}px`);
    stage.style.setProperty("--panel-y", `${p.y}px`);
    stage.style.setProperty("--panel-w", `${p.w}px`);
    stage.style.setProperty("--panel-h", `${p.h}px`);
    last = 0;
    if (!raf && !disposed) raf = requestAnimationFrame(tick);
  };

  // ---------- Timeline ----------
  const headerHeight = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
  const target = () => {
    const rect = track.getBoundingClientRect();
    const range = track.offsetHeight - stage.offsetHeight;
    if (range <= 0) return 0;
    return Math.min(Math.max((headerHeight() - rect.top) / range, 0), 1) * TOTAL;
  };

  // ---------- Captions, current step and progress ----------
  let lastBeat = "";
  let lastCaption = -2;
  const updateText = (t: number) => {
    let active = -1;
    CHAPTER_SPANS.forEach(([s, e], i) => {
      // Out, then in: two captions never overlap.
      const fadeIn = i === 0 ? 1 : smooth(s, s + CAPTION_FADE, t);
      const fadeOut = i === CHAPTER_SPANS.length - 1 ? 1 : 1 - smooth(e - CAPTION_FADE, e, t);
      const o = Math.max(0, Math.min(fadeIn, fadeOut));
      captions[i].style.opacity = String(o);
      if (o > 0.5) active = i;
    });
    if (active !== lastCaption) {
      lastCaption = active;
      captions.forEach((c, i) => c.toggleAttribute("data-current", i === active));
    }
    const b = beatAt(t);
    if (b.id !== lastBeat) {
      lastBeat = b.id;
      const line = nowLines[b.chapter];
      if (line) line.textContent = b.label;
    }
    disciplines.forEach((el, k) => {
      const id = DISCIPLINE_BEATS[k];
      if (id) el.toggleAttribute("data-active", t >= beat(id).start + 0.1);
    });
    rule.style.transform = `scaleX(${t / TOTAL})`;
  };

  const render = (t: number) => {
    drawPlate(ctx, { t, rect: drawRect, dpr, fonts, canvasW: canvas.width, canvasH: canvas.height });
    updateText(t);
  };

  // ---------- Loop: only while following the scroll position ----------
  let time = target();
  let raf = 0;
  let last = 0;
  let visible = false;
  let disposed = false;

  function tick(now: number) {
    raf = 0;
    if (disposed) return;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
    last = now;
    const goal = target();
    const diff = goal - time;
    time = Math.abs(diff) < 0.0005 ? goal : time + diff * (1 - Math.exp(-dt / FOLLOW));
    render(time);
    if (time !== goal) raf = requestAnimationFrame(tick);
    else last = 0;
  }
  const request = () => {
    if (!raf && visible && !disposed) raf = requestAnimationFrame(tick);
  };

  const onScroll = () => request();
  window.addEventListener("scroll", onScroll, { passive: true });
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
    },
    { rootMargin: "100% 0px 100% 0px" },
  );
  io.observe(track);

  const onFonts = () => {
    fonts = fontsOf(root);
    last = 0;
    if (!raf && !disposed) raf = requestAnimationFrame(tick);
  };
  document.fonts?.ready.then(onFonts);

  // The story is long; smooth-scrolling past it would take seconds. The skip link jumps instantly.
  const skip = root.querySelector<HTMLAnchorElement>('a[href="#services"]');
  const onSkip = (event: MouseEvent) => {
    const services = document.getElementById("services");
    if (!services) return;
    event.preventDefault();
    services.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
    history.pushState(null, "", "#services");
    const focusable = services.querySelector<HTMLElement>("h2, h3") ?? services;
    focusable.setAttribute("tabindex", "-1");
    focusable.focus({ preventScroll: true });
  };
  skip?.addEventListener("click", onSkip);

  resize();
  render(time);

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    skip?.removeEventListener("click", onSkip);
    ro.disconnect();
    io.disconnect();
    canvas.remove();
    for (const prop of ["--panel-x", "--panel-y", "--panel-w", "--panel-h", "--draw-x", "--draw-y", "--draw-w", "--draw-h"]) {
      stage.style.removeProperty(prop);
    }
    captions.forEach((c) => {
      c.style.removeProperty("opacity");
      c.removeAttribute("data-current");
    });
    disciplines.forEach((d) => d.removeAttribute("data-active"));
    rule.style.removeProperty("transform");
  };
}
