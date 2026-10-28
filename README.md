# godrejverano.org

Landing page for Godrej Verano, Sector 63A, Golf Course Extension Road, Gurugram. Static HTML, CSS and JS, no build step. Hosted on GitHub Pages with the custom domain godrejverano.org.

## Files

- `index.html` : the landing page (hero with form, stats, overview, highlights, price list, floor plans, amenities, specs, location with Google Map, micro market, payment plan, developer, FAQ, enquiry form, footer)
- `style.css`, `script.js` : styles and behaviour (mobile nav, form submit, popup)
- `privacy.html`, `disclaimer.html`, `404.html`
- `images/` : developer renders as responsive AVIF with WebP fallback (hero, master plan, towers, clubs, interiors, 3D floor plans)
- `robots.txt`, `sitemap.xml`, `llms.txt`, `favicon.svg`, `og.png`
- `CNAME` : custom domain for GitHub Pages

## Enquiry form

Forms post to FormSubmit (`https://formsubmit.co/ajax/aaptdubey@godrejverano.org`). The first submission triggers an activation email to that address; click the link once and all later submissions land in the inbox. On any failure the visitor is offered a WhatsApp fallback to +91 92115 35553 with the same details prefilled.

The mailbox `aaptdubey@godrejverano.org` must exist (MX records on the domain) for this to work.

## DNS for GitHub Pages

At the registrar for godrejverano.org:

```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
CNAME www   dubeyaapt26.github.io
```

Then in the repo Settings > Pages, confirm the custom domain and tick Enforce HTTPS once the certificate is issued.

## Updating prices

Prices appear in: hero, stats strip, key facts, price table, floor plan cards, FAQ (page and JSON-LD), `llms.txt`, `og.png`. Search for `5.91` to find them all.
