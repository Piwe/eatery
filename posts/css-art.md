---
title: "Bunny chow, in CSS"
published: false
tags: frontendchallenge, css, cssart, webdev
cover_image: https://REPLACE-ME/images/cover-og.jpg
---

*This is a submission for the [Frontend Challenge: Comfort Food Edition](https://dev.to/challenges/frontend-2026-07-29), CSS Art prompt.*

## Inspiration

Durban, in the 1940s. Someone needed a lunch they could carry to work and could not carry a
bowl, so they took a quarter loaf of white bread, hollowed it out, filled the hole with
mutton curry, and put the bread they had dug out back on top as a lid. That is a bunny
chow. It is one of the few dishes I can think of where the container is also the meal, and
it is the most comfortable food I know.

I wanted to see whether I could draw one without a single image, path or icon font.

## Demo

{% codepen REPLACE-WITH-YOUR-PEN-URL %}

Six elements. One `<canvas>`. That is the whole thing:

```html
<span class="dish">
  <span class="dish__steam"><i></i><i></i><i></i></span>
  <span class="dish__vessel"></span>   <!-- the loaf            -->
  <span class="dish__base"></span>     <!-- the hollowed crumb  -->
  <span class="dish__sauce"></span>    <!-- the curry           -->
  <span class="dish__accent"></span>   <!-- the bread lid       -->
  <span class="dish__accent2"></span>  <!-- the crust ridge     -->
  <span class="dish__garnish"></span>  <!-- oil and chilli      -->
</span>
```

Every element is absolutely positioned over the same square and cut to shape by a
`clip-path` held in a custom property. The loaf is an `inset()` with two rounded corners at
the top. The hollow is a darker `inset()` sitting inside it. The lid is a third `inset()`,
rotated nine degrees so it looks propped rather than placed.

The curry surface is one dot multiplied by a `box-shadow` list:

```css
--d-specks:
  -.06em -.13em 0 var(--d-speck), .05em -.16em 0 var(--d-speck),
   .11em -.11em 0 var(--d-speck), -.13em -.10em 0 var(--d-speck),
   .01em -.09em 0 #e8a33c;
```

## Journey

**Everything is in `em`, and that is the trick.** Not one measurement inside the dish is in
pixels — every clip-path, every shadow offset, every steam plume. The whole illustration
therefore scales from a single property, `font-size`, and the pen is responsive without a
media query. Drop `font-size: 3rem` on it and it is a favicon; `20rem` and it is a poster.

This pen is lifted out of a larger site I built for the other prompt in this challenge,
where the same six elements retype themselves into twelve different dishes — shakshuka,
lasagne, baklava, tiramisù — purely by re-pointing those custom properties. Sizing in `em`
is what let one dish illustration work at hero size, card size and thumbnail size without
being redrawn.

**The light JavaScript** is about forty lines: warm spice dust drifting up off the curry on
a canvas. It checks `prefers-reduced-motion` first and returns immediately if the viewer
asked for less movement — in which case the CSS steam stops too, and you get a still
illustration that still works. The canvas is `aria-hidden`; the dish itself carries
`role="img"` and a real description.

**What was hard.** Bread. A loaf is a soft, slightly irregular object and `clip-path` is
made of straight lines and precise curves. The version that finally read as bread was not
the one with the most points — it was the one where I gave up on the outline and put the
effort into the *crust ridge*, a thin pale band along the top edge. One extra element and
suddenly the brown box was a loaf.

---

No images, no icon fonts, no libraries. MIT licensed.
