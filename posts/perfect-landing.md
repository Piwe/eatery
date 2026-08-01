---
title: "Ouma, Nonna & Teta — one table, three kitchens"
published: false
tags: frontendchallenge, css, accessibility, webdev
cover_image: https://REPLACE-ME/images/cover-og.jpg
---

*This is a submission for the [Frontend Challenge: Comfort Food Edition](https://dev.to/challenges/frontend-2026-07-29), Perfect Landing prompt.*

## What I Built

A landing page for a family eatery that does not exist, where three grandmothers cook.
Ouma cooks the food of Durban and the Cape. Teta cooks the Levant and the islands. Nonna
cooks Naples. They share one long table and have never agreed on whose food is best.

The premise let me put three cuisines on one menu without it being a demo of three
cuisines. Comfort food is inherited food — that is the whole thesis of the site, and it is
why a bunny chow, a shakshuka and a tiramisù can sit on the same page and mean something
together.

**You browse the menu and build a shared table.** Tick a dish and it does not just appear
in a sidebar — its illustration is set down onto the table at the top of the panel, with a
puff of that kitchen's colour in the air, a running total, and a screen-reader
announcement. The selection *is* the artwork. That was the idea I wanted to test.

**Every dish on the page is drawn in CSS.** Twelve of them. No sprites, no icon fonts, no
SVG. The cover illustration at the top is the only image on the site.

### The dish system

The part I am most pleased with. Every dish is the same six elements:

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

A dish modifier never adds geometry. It only re-points custom properties, and those six
shared elements retype themselves into a completely different dish:

```css
.dish--shakshuka {
  --d-vessel: #3b3936;                          /* cast iron */
  --d-base: #cf3f24;                            /* tomato and pepper */
  --d-sauce-bg:                                 /* two yolks, in one layer */
    radial-gradient(circle .085em at 39% 45%, #ffd84a 0 68%, #e39b16 69% 86%, transparent 87%),
    radial-gradient(circle .075em at 58% 61%, #ffd84a 0 68%, #e39b16 69% 86%, transparent 87%);
  --d-accent-shape: inset(46% 0% 48% 88% round .03em);   /* the pan handle */
  --d-specks: -.14em -.05em 0 var(--d-speck), …          /* coriander */
}
```

Two things fall out of that:

**Everything inside a dish is measured in `em`**, so the entire illustration scales from a
single property. `font-size: 6rem` in a story card, `clamp(5.5rem, 17vw, 8.5rem)` on a
menu card, `4.4rem` once it is on the table. Same markup, three sizes, nothing redrawn.

**Garnish is one element.** Black pepper, coriander, pistachio, cocoa — all one dot
multiplied by a `box-shadow` list, with offsets in `em` so the scatter scales too. The
fourth value in each shadow is *spread*, which is how one dot becomes a grind of several
sizes:

```css
--d-specks:
  -.15em -.07em 0  .003em var(--d-speck),  -.03em -.13em 0 0      var(--d-speck),
   .09em -.10em 0  .004em var(--d-speck),   .16em  .00em 0 -.002em var(--d-speck);
```

That is the black pepper on the cacio e pepe.

### Accessibility

This prompt is judged on accessibility first, so it was designed in rather than audited on
afterwards.

- Selection is a real `<form>`: one `<fieldset>` per kitchen with a `<legend>`, and a real
  `<input type="checkbox">` per dish. No clickable `<div>`s anywhere on the page.
- Card descriptions sit **outside** the `<label>` and are attached with `aria-describedby`,
  so the accessible name is `"Bunny chow R128"` rather than a whole paragraph — but the
  description is still read on request.
- An `aria-live="polite"` region announces every change: *"Bobotie added. 3 on the table,
  R 379 total."*
- Removing a row from the table moves focus back to that dish's checkbox instead of
  dropping it on the document.
- All artwork is `aria-hidden` and carries no information that is not already in text.
- `prefers-reduced-motion: reduce` stops every animation and the canvas never starts.
  `forced-colors: active` drops the art entirely and gives every card a system border.
- Light and dark both supported. Chrome colours respond to the scheme; food colours do not,
  because a tomato is the same colour at night.

**Lighthouse: 100 accessibility, 100 best practices, 100 SEO, 99 performance. axe-core:
0 violations** — in light, in dark, and with dishes on the table.

## Demo

{% embed REPLACE-WITH-YOUR-GITHUB-REPO-URL %}

**Live:** https://REPLACE-ME
**Source:** https://REPLACE-ME (MIT)

No framework, no dependencies, no build step. Clone it and open `index.html`.

## Journey

**Three cuisines needed one reason to share a menu.** My first pass was a cuisine switcher
— three tabs, three menus. It was fine and it was dead. Nothing about it said *comfort*.
Making them three grandmothers who share a kitchen fixed the page in one move: the menu
stopped being a filter demo and became a family with an argument in it. Everything after
that got easier to write, including the copy.

**The dish system was the second attempt.** I drew the bunny chow first, freehand, as
about forty lines of one-off CSS. Then I drew the shakshuka the same way and realised I
was going to do that eleven more times and end up with 800 lines nobody could change. So I
went back and asked what all twelve dishes actually have in common: something you eat off,
something underneath, something poured over, one or two things that make it *that* dish,
and specks. Six elements. After that, adding a dish was fifteen lines of custom
properties, and the system started suggesting things — the moment `--d-accent-bg` took a
full background value, the wors could be a `radial-gradient` ring and the halloumi could be
`repeating-linear-gradient` grill marks.

**Sizing in `em` was the decision that paid off most.** I did not plan for dishes to end up
on a shared table at thumbnail size. When I built that panel, it was one line —
`.dish--sm { --d-size: 4.4rem }` — because nothing inside a dish was ever measured in
pixels.

**The bug that taught me the most.** I built the JavaScript as ES modules, because that is
what you reach for now. Everything worked. Then I opened `index.html` by double-clicking it
instead of serving it, and the page looked completely normal — it rendered, the checkboxes
ticked, the layout held — and absolutely nothing happened when you chose a dish. A module
is *fetched*, and a fetch from a `file://` page is blocked by CORS, so not one line of my
JavaScript had run. The failure was invisible precisely *because* the page degrades well
without JS. I moved to deferred classic scripts on one namespace. Slightly less modern,
and now anyone can open the file and have it work, which for a submission somebody else has
to review is worth more than the module syntax.

**The other bug I am glad I caught.** I had `transition: all` on the filter chips. `all` includes
`outline-width`, so the focus ring animated in from zero — a keyboard user got a ring that
arrived late, at the wrong colour, on every single chip. axe cannot see it; contrast
checkers cannot see it; it only showed up when I tabbed through the page and read the
computed styles at the moment of focus. I now think `transition: all` is a straightforward
accessibility hazard and not just untidy.

**The hardest of the twelve was the cacio e pepe**, and it is worth saying why. The other
eleven have something to grab onto — the shakshuka has two yolks and a black pan, the
baklava has a lattice. Cacio e pepe is a pale dish in a pale bowl. My first attempt was a
`repeating-radial-gradient` of concentric circles, and it looked like a dartboard. Two
changes fixed it. First, the coils became an *ellipse*, off-centre, with a second winding
laid over them from a different centre — two sets of concentric rings interfering with
each other stop reading as a target and start reading as something tangled. Second, the
colour stops went soft. Hard bands read as rope; a gradient across each coil gives it a
round side, and suddenly it is a strand.

**What I would do next.** The menu is content in HTML rather than data in JavaScript,
which keeps the page working with JS disabled but does make adding a thirteenth dish a
copy-paste job. I would take that trade again, but I would not pretend it is free.

---

Built with vanilla HTML, CSS and JavaScript. MIT licensed. The restaurant is fictional;
the dishes are not.
