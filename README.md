# Jacques Auto — Production Website

Quality used vehicle dealership site for Jacques Auto (Klipfontein, eMalahleni, South Africa). Static HTML/CSS/JS, built for GitHub Pages.

## Structure

```
index.html            Homepage (hero, stock, lot, why us, finance, reviews, gallery, contact)
about.html            Company story
inventory.html        Full vehicle inventory
finance.html          Finance process + FAQ
contact.html          Contact details + enquiry form + map
testimonials.html     Customer reviews
404.html              Custom error page

robots.txt            Crawler rules + sitemap reference
sitemap.xml           XML sitemap of all public pages
site.webmanifest       PWA manifest (primary)
manifest.webmanifest  PWA manifest (alias, same content)
browserconfig.xml      Windows tile config
favicon.ico, CNAME, .nojekyll

assets/
  css/    main.css (tokens + components), animations.css (reveal/keyframes), responsive.css (media queries)
  js/     navigation.js (nav + mobile menu), animations.js (scroll reveal + counters), main.js (lightbox + form)
  images/ site imagery, /inventory/<model>/ real stock photos, /posters/ poster scans
  icons/  icon.svg (source) + generated PNG sizes, apple-touch-icon.png
  videos/, fonts/  reserved for future use
```

## Local preview

No build step — open `index.html` directly, or serve the folder:

```
python3 -m http.server 8000
```

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Repo Settings → Pages → Source: deploy from the `main` branch, root folder.
3. Update `CNAME` with your real domain (currently a placeholder: `jacquesauto.com`) and add the matching A/CNAME DNS records at your registrar.
4. Once live, submit `sitemap.xml` in Google Search Console and request indexing.

## Before going live (manual tasks)

- [ ] Confirm `jacquesauto.com` is the real domain, or replace `CNAME` and all canonical/OG URLs (currently hardcoded to `https://jacquesauto.com`).
- [ ] Replace placeholder vehicle prices/mileage in `inventory.html`'s "More on the lot" section with real listings (those cards use real photos from `assets/images/inventory/` but no price data was provided).
- [ ] Swap `assets/images/hero-bg.jpg` and vehicle photos for current, high-resolution stock photography. A real hero photo (`hero-background-source.webp`) was found in the original assets and is included but not wired in — review and swap in if preferred.
- [ ] Replace the placeholder Google Maps embed query in the `.map iframe` (in `contact.html`, `about.html`, `index.html`) with a verified Google Maps place link.
- [ ] Add real social profile URLs to the `sameAs` array in the Organization schema (currently empty) once social accounts exist.
- [ ] Generate/replace `favicon.ico` and `assets/icons/*` with final brand artwork if the placeholder swoosh icon isn't final (currently auto-generated from the logo mark in the design).
- [ ] Hook up the enquiry form (`#enquiryForm`) to a real backend or form service (e.g. Formspree) — it currently only shows a client-side success message and does not send data anywhere.
- [ ] Add Google Analytics / Search Console verification once the domain is live.
- [ ] Compress/convert images to WebP/AVIF for further performance gains (currently JPEG).

## Notes for future edits

- All pages share the same header/footer/nav markup and the same three CSS files — keep them in sync when editing by hand, or regenerate from a template if you reintroduce a build step.
- `<meta name="robots">` on `404.html` is `noindex, follow` intentionally.
