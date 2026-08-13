# Artisans — Events & Beyond 🪔

A cinematic, photo-driven website for an Indian wedding & event decor studio in
Charlotte, NC — built for the real mandap work of **@eventsbyartisans / @artisansdecors**.

Everything lives in one dependency-free `index.html` — no framework, no build step.

## Motion & effects

- **Hero** — full-screen photo slideshow with slow Ken Burns pan/zoom, crossfades,
  swaying marigold garlands, floating petals and a shimmering gold headline.
- **3D Motion Showcase** — a rotating ring of photo cards you can drag to spin
  (auto-rotates, pauses on hover).
- **Parallax banners** — two full-width photo bands that shift at a different
  speed than the page as you scroll.
- **Gallery** — photo cards with 3D hover tilt, slow zoom, gold shine sweep, and a
  full-screen **lightbox** (click any photo; arrow keys / swipe buttons to browse).
- **Film strip** — an endless slow-scrolling row of photos.
- Plus scroll progress bar, reveal-on-scroll, animated counters, testimonial
  carousel, mobile menu, and `prefers-reduced-motion` support.

## ⭐ Putting in the REAL photos (the important part)

The `images/` folder currently holds **stylized bokeh stand-ins** (warm defocused-light
placeholders generated for layout). Replace them with real decor photos **using the same
filenames** and every section — hero, carousel, gallery, banners, strip, lightbox —
switches to the real photography automatically. No code changes needed.

| File | Used as |
|---|---|
| `hero-1.jpg` … `hero-4.jpg` | Hero slideshow (landscape, ≥1920px wide looks best) |
| `gallery-1.jpg` | Gallery: "The Peacock Court" (portrait 4:5) |
| `gallery-2.jpg` | Gallery: "Marigold Muhurtham" |
| `gallery-3.jpg` | Gallery: "Gilded Gopuram" |
| `gallery-4.jpg` | Gallery: "Rose Veranda" |
| `gallery-5.jpg` | Gallery: "Vineyard Nocturne" |
| `gallery-6.jpg` | Gallery: "Golden Hour Grove" |
| `banner-1.jpg`, `banner-2.jpg` | Parallax banners (wide landscape) |
| `about-1.jpg` | "Our Craft" portrait |

`.jpeg`, `.png` and `.webp` extensions also work.

**Easiest way (from your phone or laptop):** open this repo on GitHub → navigate to
`artisans-events-decor/images` → **Add file → Upload files** → drag the photos in,
rename to match the table, commit. Done — the site is instantly real.

## Run it

Open `index.html` in a browser, or:

```bash
cd artisans-events-decor
python3 -m http.server 8080   # http://localhost:8080
```

## Deploy

Any static host (GitHub Pages, Netlify, Vercel) — point it at this folder. No build.

## Customize

- Colors: `:root` CSS variables at the top of `index.html`.
- Contact email: search `hello@artisansevents.com` (2 places).
- Gallery titles/captions: the `GALLERY` array in the `<script>` at the bottom.
