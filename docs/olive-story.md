# The brand story: "From one idea to a whole brand"

**Status:** Eight-chapter, scroll-driven story on the home page, between the hero and the services sequence (S1). Public, and included in every build unless `STORY_PREVIEW=false`.
**Last updated:** 2026-11-13 (rebuilt as a conceptual construction drawing; replaces the olive story)
**Code:** `components/home/story/`:
- `beats.ts`: the 44-beat timeline.
- `plate.ts`: the construction drawing (axonometric, Canvas 2D).
- `StoryPlayer.tsx`: layout, scroll follow, captions, and the stills of the static layout.
- `Story.tsx`: markup and the static fallback.
- `stages.ts`: chapter words.
- `StorySlot.tsx` / `StorySlot.off.tsx`: the off switch (`STORY_PREVIEW=false`).

Also `app/components.css` (the brand story block), `lib/motion.ts` (`STORY_MOTION_QUERY`), `next.config.ts`, and `components/home/HeroGround.tsx` (the hero's figure, which is the story's first frame).
**Assets:** none. The story is drawn, not photographed. The file and folder names still say "story"; the module path is unchanged so the build switch and checks keep working.

---

## 1. What changed, and why (2026-11-13)

The olive story followed one founder planting an olive pit through to harvesting, pressing, bottling and tasting oil, with generated photographs beside a flat line drawing. Owner feedback:

- the drawing was too flat and 2D;
- some lines were misaligned;
- the story was *contextual* (olive oil production) where it should be *conceptual*: how a brand is designed and presented;
- the page background was too plain.

The rebuild keeps the idea (one small beginning grows into a whole ecosystem) and the scroll engine, and replaces the narrative, the drawing and the photographs:

| | Olive story | Brand story |
|---|---|---|
| Narrative | Seed → planting → germination → cultivation → growth → harvest → oil → grove | Point → strategy → mark → colour and type → system → applications → presented → ecosystem |
| Drawing | Flat 2D section through a planter | Axonometric construction drawing: solids rise out of a ground grid |
| Depth | None | Lit top, lit side, hatched shade side on every solid; objects rise into place; the camera steps back |
| Photographs | Nine generated photographs (a founder, olive settings) | None |
| Length | 28.6 units (~20 viewports on desktop) | 13.6 units (~10 viewports) |
| Static layout | A photograph per chapter | A still of each chapter's last step, drawn by the same code |

The generated photographs are no longer used anywhere, so the imagery exception recorded on 2026-11-13 in `docs/imagery-direction.md` §5 no longer applies to anything on the site. `assets/story/` and `scripts/prepare_story_assets.py` are unused; they can be deleted in a separate change.

## 2. The narrative

One point on a blank ground is the idea. Everything that follows is built from it, and in the end every piece is traced back to it.

| Chapter | Beats | What the drawing shows |
|---|---|---|
| 1. The idea (4) | blank ground · a single point · a direction · a circle around it | The ground's edge is drawn; the Gold point appears; a line rises from it; a circle is drawn round it |
| 2. Strategy (5) | who · what · why · how · one direction | Four lines run from the point to four small blocks, each named; they are joined, and the direction extends upward |
| 3. The mark (5) | a drawing board rises · square and circle · the circle becomes an arch · the mark resolves · it is given depth | Construction geometry on an upright board, the arch traced from it, filled in Espresso, then extruded towards the viewer |
| 4. Colour and type (6) | a first colour · a second · an accent · two grounds · a headline face · a text face | Five palette blocks rise one by one at heights that show their proportion; two panels carry "Aa" in Cormorant and in Jost |
| 5. The system (5) | a grid · each piece finds its place · measured spacing · a voice · one system | A Gold module grid; the pieces slide onto it; a dimension line; a small voice card; a boundary drawn round it all |
| 6. Applications (6) | website · search and AI answers · content · print · signage · social | Each rises from the system carrying the mark: a site, a search result with an AI answer, pages, a card, a sign, posts |
| 7. Presented (4) | brought together · traced back to one point · presented as one · recognised at a glance | A plinth rises under everything; Gold lines run from every mark back to the point, then clear |
| 8. The ecosystem (5) | stepping back · it travels · further · wherever people meet it · a whole brand, from one point | The camera steps back; rings of smaller stands appear, each carrying the mark, linked back to the point |

The mark is an arch cut from the construction square and circle, with the Gold point at its base. It is an illustrative client mark, not the CALIX logo.

Chapter 6's caption lists the services the channels stand for (web design and development, SEO, GEO, content, digital marketing), highlighted as each channel rises.

## 3. The drawing

### Projection and depth

- **Axonometric projection** at 30°: x runs right and towards the viewer, y left and towards the viewer, z up. One world unit is about a CSS pixel at a camera span of 1000.
- **Solids** are boxes. Each visible face has its own fill: the top and the lit side (towards the lower left) carry content, and the shade side (lower right) is hatched with 45° hairlines. The colours are the five palette values only. There are no gradients, shadows or blurs, and no tints as resting states; opacity is used only while something appears or leaves.
- **Content on faces** (the mark, "Aa", page lines) is drawn in face coordinates through a canvas transform, and clipped to its face.
- **Pixel alignment:** every vertex is snapped to the device-pixel grid before it is stroked, and fills share the snapped vertices, so 1px lines are crisp and fills meet their outlines exactly.
- **Order:** the ground grid, then plinths, then the Gold point, then solids back to front, then overlay lines and labels.

### Camera

A key per beat (`CAMERA` in `plate.ts`: centre and span), interpolated between beat ends. The grid spacing doubles whenever its lines would fall closer than about 34px on screen, so the ground stays calm as the camera steps back. Portrait screens frame about 20% tighter.

### Stateless frames

`drawPlate(ctx, { t, … })` draws the frame for timeline position `t` with no memory of earlier frames. The pinned stage and the stills of the static layout use the same function.

## 4. The stage and scrolling

- **Pinned stage:** `.story__stage` is `position: sticky` inside a tall `.story__track`. When the track ends, the stage scrolls away into the services section.
- **One timeline of 13.55 units**, read directly from scroll position: no triggers, snapping or scroll interception. One unit is 64svh of scrolling on phones, 70svh from 768px and 72svh from 1200px.
- **Follow:** the picture follows the scroll position with 90ms of smoothing, renders only while catching up, and not while off screen.
- **Layout:** landscape (≥820px wide), the drawing on the left and the caption in a right-hand column; portrait, the drawing above the caption.
- **Captions** are real HTML. They fade out, then in, between chapters; the "now" line names the current beat; a Gold progress rule has chapter ticks.
- **Access:** "Skip to our services" jumps straight to `#services` and moves focus there. The header's "Start a Project" stays above the stage.

### Fallbacks

| Condition | Result |
|---|---|
| `prefers-reduced-motion: reduce` | Eight static stages, each with a still of its last step, its caption and its list of steps. Nothing moves |
| Viewport shorter than 480px | Same |
| JavaScript disabled | The eight captions and step lists, without stills |

## 5. Running it locally

```bash
npm ci

# Development server and production build: the story is included (STORY_PREVIEW=false hides it)
npm run dev                  # http://localhost:3000
npm run build && npm start   # public build, story included, indexable

# Noindex review build (written to .next-preview, never to .next)
npm run build:preview        # STORY_PREVIEW=true NOINDEX=true next build
npm run start:preview        # STORY_PREVIEW=true NOINDEX=true next start

# Checks
npm run validate             # lint, typecheck (every story file), check:story
npm run verify:builds        # public build (story, indexable) and preview build (story, noindex)
```

| Command | `STORY_PREVIEW` | `NOINDEX` | Result |
|---|---|---|---|
| `next dev` | unset or `true` | any | Included |
| `next dev` | `false` | any | Left out |
| `next build` / `next start` | unset | any | **Included** (public build). Output in `.next` |
| `next build` / `next start` | `false` | any | **Left out**: `@/components/home/story/StorySlot` resolves to `StorySlot.off.tsx`. Output in `.next` |
| `next build` / `next start` | `true` | not `true` | **Refused** with an explanation |
| `next build` / `next start` | `true` | `true` | Preview: included, every page `noindex, nofollow`, `robots.txt` disallows everything. Output in **`.next-preview`** |

Why preview output has its own folder: the pages are prerendered, so a build's story and noindex settings are fixed in its output. Before this, a preview build replaced `.next`, and a plain `next start` (the production process) would then have served the story with noindex on every page.

**Changing the story:**
- To add or retime a beat, edit `beats.ts`, then draw its state in `plate.ts` using `progress(t, id)` or `through(t, …)`.
- Durations are in timeline units. The section's length follows `TOTAL` automatically.

## 6. Building, checking and deploying safely

### What protects the story code

Public builds compile the story. A build with `STORY_PREVIEW=false` swaps it for an empty stand-in, so these checks also cover the off switch and the review build:

- **`npm run typecheck`:** type-checks every `.ts`/`.tsx` file in the repository, story files included, whatever the build aliases. A stale file that imports exports which no longer exist fails here.
- **`npm run check:story`** (`scripts/check-story.mjs`):
  - `config`: loads `next.config.ts` for each phase and combination of `STORY_PREVIEW` and `NOINDEX`. It checks that public builds include the story, that `STORY_PREVIEW=false` leaves it out, that preview builds include it and write to `.next-preview`, and that `STORY_PREVIEW=true` without `NOINDEX=true` is refused by both `next build` and `next start`.
  - `sources`: checks that every story file is in the TypeScript program, and that `app/page.tsx` → `StorySlot` → `Story` → `StoryPlayer` is still wired, with `StorySlot.off.tsx` as the empty stand-in.
  - `output DIR public|preview|off`: checks a finished build's prerendered home page. A public build must have the story, no story photographs, and be indexable; a preview build must have the story and be noindex; an `off` build (`STORY_PREVIEW=false`) must have no story, no story images, and be indexable.
- **CI** (`.github/workflows/validate.yml`): runs `npm run validate` and `npm run verify:builds` on every push and pull request.

### Story files: what belongs here

The current story is the construction drawing: `Story.tsx`, `StoryPlayer.tsx`, `beats.ts`, `plate.ts`, `stages.ts`, `StorySlot.tsx` and `StorySlot.off.tsx`.

**Earlier versions are not part of it.** `film.ts` (the photograph window of the olive story) and `StoryFilm.tsx` (the WebGL renderer of the 2.5D version, deleted in commit 3eed894) belong to replaced stories. Restoring either on its own fails type-checking, and reviving the olive story means restoring every story file from the same commit.

To restore a story file, take it from the same commit as the rest of the story, then run `npm run validate`:

```bash
git log --oneline -- components/home/story/            # find the commit
git restore --source=<commit> -- components/home/story/<file>
npm run validate
```

### Deploying the public site (PM2)

Production runs `next start` from `.next`, with neither story variable set (the story is included). Build in the deployment directory only once everything else passes:

```bash
pm2 show calix-web                     # note "exec cwd" (the deployment directory) and the script
pm2 env 0 | grep -E 'STORY_PREVIEW|NOINDEX'   # use calix-web's id; expect no output
cd <deployment directory>
git status --short                     # expect no unexpected changes
npm ci
npm run validate                       # stop here if anything fails: the running site is untouched
cp -a .next ../next-backup-$(date +%Y%m%d%H%M)   # rollback copy of the live build
env -u STORY_PREVIEW -u NOINDEX npm run build
node scripts/check-story.mjs output .next public # story, indexable
pm2 restart calix-web                  # keeps the process's own environment
curl -s https://<production-host>/ | grep -c data-story-root      # expect 1
curl -s https://<production-host>/ | grep -c 'content="noindex'   # expect 0
```

**Rollback:** `rm -rf .next && cp -a ../next-backup-<stamp> .next && pm2 restart calix-web`.

Note that `next build` replaces `.next` while the old process is still serving from it. Restart straight after a successful build.

### Reviewing the preview

1. Run `npm run build:preview` and `npm run start:preview` on a separate port or host. Never point the public domain at it.
2. Put the preview behind the host's protection, for example basic auth in the reverse proxy, so unreleased changes aren't seen before they ship.
3. Before promoting anything, confirm the production build had neither variable set: run `node scripts/check-story.mjs output .next public`, and check that `curl -s https://<production-host>/ | grep -c 'content="noindex'` returns 0.
4. To take the story off the public site, rebuild with `STORY_PREVIEW=false` and check with `node scripts/check-story.mjs output .next off`.

## 7. Validation

See the validation table at the end of the change that introduced this version (2026-11-13), recorded below once run.
