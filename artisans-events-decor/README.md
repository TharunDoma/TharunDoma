# Artisans — Events & Beyond 🪔

A handcrafted, single-file website for an Indian wedding & event decor studio in
Charlotte, NC — inspired by the real mandap work of **@eventsbyartisans / @artisansdecors**.

## What's inside

Everything lives in one dependency-free `index.html` (no build step, no framework):

- **Hero** — layered mandap scene drawn entirely in SVG (gold pillars, temple doors,
  elephants, brass lamps), swaying marigold garlands, floating flower petals,
  mouse parallax and a shimmering gold title.
- **Our Craft** — story section with a 3D-tilting illustrated panel and animated counters.
- **Celebrations** — service cards (mandaps, haldi, sangeet, outdoor) with 3D hover tilt
  and expanding gold corner frames.
- **Gallery** — six cards, each with a hand-drawn SVG rendition of a real decor style
  (peacock court, marigold muhurtham, gilded gopuram, rose veranda, vineyard nocturne,
  golden-hour grove). Drop real photos in `images/` and they replace the art automatically.
- **Process, testimonials carousel, venue chips, contact form** (opens a pre-filled email),
  and a footer diya with a flickering flame.
- Respects `prefers-reduced-motion`, fully responsive, mobile menu included.

## Using real photos

Save your Instagram photos into `images/` with these names — each card swaps its
illustration for the photo automatically (if a file is missing, the SVG art stays):

| File | Card |
|---|---|
| `images/gallery-1.jpg` | The Peacock Court |
| `images/gallery-2.jpg` | Marigold Muhurtham |
| `images/gallery-3.jpg` | Gilded Gopuram |
| `images/gallery-4.jpg` | Rose Veranda |
| `images/gallery-5.jpg` | Vineyard Nocturne |
| `images/gallery-6.jpg` | Golden Hour Grove |

Portrait crops (4:5) look best.

## Run it

Open `index.html` in a browser — that's it. Or serve locally:

```bash
cd artisans-events-decor
python3 -m http.server 8080   # http://localhost:8080
```

## Deploy

Any static host works (GitHub Pages, Netlify, Vercel). For GitHub Pages:
point Pages at this folder (or copy its contents to a `gh-pages` branch / a
dedicated repo) and it's live — no build required.

## Customize

- Colors live in the `:root` CSS variables at the top of `index.html`
  (temple gold, marigold, maroon, jasmine ivory…).
- Contact email: search for `hello@artisansevents.com` and replace (2 places).
- Instagram links: search for `instagram.com`.
