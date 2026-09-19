# Pan African Women Freelancers &amp; Tech Talent

A fast, mobile-first marketing website for a pan-African freelance marketplace where
African women in technology and digital work can be discovered, hired and paid.

Built as plain **HTML, CSS and JavaScript** — no build step, no framework, no
dependencies. The whole site is a handful of static files that can be hosted
anywhere (GitHub Pages, Netlify, Cloudflare Pages, or any web server).

---

## What this is (and what it is not)

This repository contains the **public website**. The full MVP described in the
project specification — authentication, freelancer profiles, proposals, contracts,
escrow payments and the admin dashboard — is **not** included here. The
interactivity on this site is front-end only; buttons such as *Hire Me* and the
search fields show honest placeholder messages rather than pretending to work.

---

## Running it locally

The site is static, so you only need a local web server (opening `index.html`
directly with `file://` will work for the layout, but not for every asset path).

**Option 1 — the included zero-dependency server (Windows):**

```powershell
cd website
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Then open <http://localhost:5500/>. The server sends sensible security headers
(CSP, `X-Content-Type-Options`, `X-Frame-Options`) and guards against directory
traversal.

**Option 2 — anything else:**

```bash
python3 -m http.server 5500     # Python
npx serve                        # Node
```

---

## Project structure

```
website/
├── index.html                  # the whole page
├── css/
│   └── styles.css              # design tokens + all styling
├── js/
│   └── main.js                 # nav, filters, tabs, carousel, form validation
├── assets/
│   ├── logo.png                # brand logo
│   ├── logo-160.png            # web-optimised logo
│   ├── logo-96.png             # web-optimised logo
│   ├── people/                 # illustrated freelancer portraits (p1–p6.svg)
│   └── photos/
│       ├── *.jpg               # CC BY-SA 4.0 photography
│       └── credits.json        # full attribution + licence record
└── serve.ps1                   # local preview server
```

---

## Brand

| Token | Hex | Use |
|---|---|---|
| Plum purple | `#541650` | Gradients, depth |
| Near-black violet | `#2D0635` | Base background, outlines |
| Gold | `#DFA02A` | Accents, borders, italic type |
| Bright gold | `#F8C238` | Highlights, numbers, CTAs |

---

## Images and licensing

Photographs were sourced from **Wikimedia Commons** under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), which permits
commercial use **with attribution**. Attribution is displayed in the site footer
and recorded in full in [`website/assets/photos/credits.json`](website/assets/photos/credits.json) —
including the source file title, licence and canonical URL for each image.

The photographs are used as illustrative imagery of African women in technology.
They **do not depict platform users**, and no real person is presented as a
freelancer on this platform. The freelancer card portraits in
`website/assets/people/` are original illustrations drawn for this project and
do not depict real people.

> **If you reuse or redistribute this project**, keep the footer attribution and
> `credits.json` intact. CC BY-SA also requires that derivative works be shared
> under the same licence. The site code itself is yours to license as you wish.

---

## Replacing the placeholder portraits with real photos

The freelancer cards use illustrated SVG portraits by design — using real
people's photographs on cards that claim they are platform users would
misrepresent them. When you have real freelancers:

1. Add their photo to `assets/photos/` (a square image works best).
2. Replace the `<img>` in the relevant `.talent-card`:

```html
<!-- from -->
<img class="avatar" src="assets/people/p1.svg" alt="..." width="64" height="64" loading="lazy" />
<!-- to -->
<img class="avatar" src="assets/photos/your-freelancer.jpg" alt="Your Name" width="64" height="64" loading="lazy" />
```

The CSS crops to a circle automatically, so no other changes are needed.

---

## Performance notes

The site is deliberately light, because the audience is mobile-first and often on
slow or metered connections:

- No frameworks, no third-party JavaScript, no trackers.
- Photography is lazy-loaded below the fold (`loading="lazy"`).
- Freelancer portraits are inline-friendly SVG (~3&nbsp;KB each).
- Scroll animations are progressive enhancement — **all content is visible with
  JavaScript disabled**.
- Respects `prefers-reduced-motion`.

---

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`) and a skip link.
- Every image has meaningful `alt` text (decorative images use `alt=""`).
- Visible focus styles, ARIA attributes on the menu, tabs and carousel.
- Tested at 390&nbsp;px (mobile) and 1440&nbsp;px (desktop) with no horizontal overflow.
