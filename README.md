# Ouma, Nonna & Teta

**One table, three kitchens.** A landing page for a fictional family eatery where three
grandmothers cook: Ouma from Durban and the Cape, Teta from the Levant and the islands,
and Nonna from Naples. You browse their menu and build a shared tasting table — and the
dishes you choose assemble themselves onto the table as CSS artwork.

Built for the [DEV Frontend Challenge: Comfort Food Edition][challenge] —
**Perfect Landing** prompt. Deadline: 16 August 2026.

[challenge]: https://dev.to/challenges/frontend-2026-07-29

---

## Run it

Open `index.html`. That is the whole instruction — no build step, no dependencies, no
server.

That is deliberate. The scripts are classic `<script defer>` files on a single `Eatery`
namespace rather than ES modules, because a module is *fetched*, and a fetch from a
`file://` page is blocked by CORS. A module build of this site looks completely fine when
you double-click it — the page renders, the checkboxes tick, because that is native
browser behaviour — and does nothing at all, silently, because no JavaScript ever ran.
Anyone reviewing this should be able to open the file and have it work.

If you would rather serve it:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## What's here

```
index.html               the whole site — and the source of truth for the menu
css/tokens.css           design tokens; light + dark, kitchen accent colours
css/base.css             reset, type, focus ring, reduced motion, forced colours
css/dishes.css           the dish art system (see below)
css/components.css       buttons, chips, cards, tags, plate rows
css/layout.css           page layout and the two breakpoints
js/menu.js               filtering
js/plate.js              selection, the running total, plate composition
js/effects.js            canvas steam + spice-dust burst
js/main.js               entry point
images/eatery.png        the source cover illustration
images/cover-*.webp      responsive hero variants (480 / 640 / 800 / 1200)
images/cover-og.jpg      1200×630 social + DEV post cover
images/favicon.*         favicon, cut from the bunny chow in the cover
codepen/bunny-chow.html  the CSS Art entry, self-contained and ready to paste
posts/                   both DEV submissions, written and ready to publish
```

## The dish art system

Twelve dishes, all CSS, no sprites and no icon fonts — the cover illustration in the hero
is the only image on the site. Every dish is the same six elements:

```html
<span class="dish dish--shakshuka">
  <span class="dish__steam"><i></i><i></i><i></i></span>
  <span class="dish__vessel"></span>
  <span class="dish__base"></span>
  <span class="dish__sauce"></span>
  <span class="dish__accent"></span>
  <span class="dish__accent2"></span>
  <span class="dish__garnish"></span>
</span>
```

A dish modifier never adds geometry. It only re-points custom properties, and the shared
elements retype themselves into a different dish:

```css
.dish--shakshuka {
  --d-vessel: #3b3936;                          /* cast iron */
  --d-base: #cf3f24;                            /* tomato and pepper */
  --d-sauce-bg:                                 /* two yolks, one layer */
    radial-gradient(circle .085em at 39% 45%, #ffd84a 0 68%, #e39b16 69% 86%, transparent 87%),
    radial-gradient(circle .075em at 58% 61%, #ffd84a 0 68%, #e39b16 69% 86%, transparent 87%);
  --d-accent-shape: inset(46% 0% 48% 88% round .03em);   /* the pan handle */
  --d-specks: -.14em -.05em 0 var(--d-speck), …          /* coriander */
}
```

Two consequences worth naming:

- **Everything inside a dish is measured in `em`**, so the whole illustration scales from
  one property. `.dish--lg` in the hero, the default on a menu card, `.dish--sm` on the
  table — same markup, three sizes, no redrawing.
- **Garnish is one element.** Seeds, pepper, pistachio and cocoa are a single dot
  multiplied by a `box-shadow` list, with offsets in `em` so the scatter scales too.

## Progressive enhancement

The menu lives in `index.html`, not in a JavaScript array. `js/` reads the DOM rather than
rendering it, which means there is one copy of the content, and with JavaScript disabled
the page is still a complete menu with a working form. Filtering, the running total, the
plate composition and the canvas effects are all additive.

## Accessibility

Accessibility is the first judging criterion for this prompt, so it was designed in, not
audited on afterwards:

- Selection is a real `<form>` of `<fieldset>` + `<input type="checkbox">` — one fieldset
  per kitchen, each with a `<legend>`. No clickable `<div>`s anywhere.
- Card descriptions sit *outside* the `<label>` and are attached with `aria-describedby`,
  so the accessible name stays "Bunny chow R128" instead of a paragraph.
- An `aria-live="polite"` region announces every change: *"Bobotie added. 3 on the table,
  R379 total."*
- Removing a row moves focus back to that dish's checkbox rather than letting it fall to
  the document.
- Filter chips are `<button>` with `aria-pressed`; the result count is announced via
  `role="status"`.
- One visible `:focus-visible` ring, never removed; the whole card lifts when the control
  inside it takes focus.
- All artwork is `aria-hidden` and duplicates no information. Every dish has a real name
  and a real description in text.
- `prefers-reduced-motion: reduce` kills every animation and the canvas never starts.
- `forced-colors: active` drops the art entirely and gives cards a system border.
- Light and dark both supported. Chrome colours respond to the scheme; food colours do
  not, because a tomato is the same colour at night.

### Audit results

| | |
|---|---|
| Lighthouse | **99** performance · **100** accessibility · **100** best practices · **100** SEO |
| axe-core 4.12 (WCAG 2.0/2.1/2.2 A + AA + best-practice) | **0 violations** — light, dark, and with dishes on the table |
| Keyboard | 22 tab stops in document order, every one with a visible focus ring; Space toggles a dish and the table updates; removing a row returns focus to that dish's checkbox |
| Accessibility tree | 12 `checkbox` nodes named `"Bunny chow R128"` etc., 3 kitchen `group`s named from their legends, 1 `complementary` named "Your table", 2 `status` regions, 0 unnamed interactive or image nodes |
| 200% zoom | no clipping, no horizontal scroll (checked at a 720 px viewport) |
| Console | no errors, no warnings |

Two axe items come back as *needs manual review* rather than pass or fail, both benign:
`aria-required-children` on the table list while it is still empty, and `color-contrast` on
the "Nothing on the table yet" text, which sits on a gradient (it measures 7.3:1 against
the darkest point of that gradient).

Not run: a real screen reader. The accessibility tree above was read out of Chrome's
`Accessibility.getFullAXTree`, which tells you what NVDA or VoiceOver would be handed, but
is not a substitute for listening to one. That check is still worth doing before you
publish.

Colour choices are not eyeballed — `--ouma`, `--teta` and `--nonna` were each adjusted
until they cleared 4.5:1 against every light surface token, and their dark-scheme
counterparts against every dark one, so a kitchen colour can be used for a heading and not
only for decoration. The ratios are recorded next to the values in `css/tokens.css`.

## Performance

- No dependencies, no build, no network requests beyond five CSS files, four JS modules and
  one image.
- Steam is CSS, and only animates on the dish you are hovering, focusing or have chosen —
  twelve idle dishes with three plumes each is a lot of compositing for nothing.
- The canvas stops on `IntersectionObserver` when the table scrolls away, on
  `visibilitychange` when the tab is hidden, and never starts under reduced motion. DPR is
  capped at 2.
- The cover ships as four WebP widths behind `srcset`/`sizes`, with `width`/`height` and
  `aspect-ratio` set so it reserves its own space — CLS is 0.
- One deliberate trade: the five CSS files are five render-blocking requests, and
  concatenating them would buy roughly 200 ms on a throttled connection. They stay split,
  because the file boundaries are the clearest explanation of how the design system is put
  together, and this project is meant to be read as much as loaded. Over HTTP/2 with
  compression — which is what GitHub Pages serves — the real cost is far smaller than the
  local test server suggests.

## Cover image

`images/eatery.png` is the source illustration: the three kitchens laid out on one table,
which is the whole premise of the site in a single picture. Every other asset in `images/`
is derived from it: four WebP widths for the hero, a 1200×630 JPEG for `og:image` and the
DEV post cover, and the favicon — a square crop of the bunny chow, the one dish in the
picture that still reads at 16 px.

Before deploying, replace the two relative `og:image` / `twitter:image` URLs in
`index.html` with absolute ones. Most scrapers will not resolve a relative path.

## Submitting

Both posts are written and sitting in `posts/`, in DEV's front-matter format:

- `posts/perfect-landing.md` — the main entry, **Perfect Landing** prompt
- `posts/css-art.md` — the second entry, **CSS Art** prompt, pointing at
  `codepen/bunny-chow.html`

Multiple submissions are allowed, one post per prompt. Before publishing:

1. Deploy (GitHub Pages serves this folder as-is) and fill in every `REPLACE-ME`.
2. Paste `codepen/bunny-chow.html` into a pen — the `<style>` block goes in the CSS pane,
   the body in the HTML pane, the `<script>` in the JS pane — and put its URL in
   `posts/css-art.md`.
3. Set `published: true`, confirm the `frontendchallenge` tag, and check the cover image
   rendered on the preview card.
4. Optional but worth it: a screen reader pass, per the note above.

Deadline: **16 August 2026, 11:59 PM PDT**.

## Licence

MIT — see [LICENSE](LICENSE). The restaurant is fictional; the dishes are not.
