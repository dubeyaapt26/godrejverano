# godrejverano.org

Landing page for Godrej Verano, Sector 63A, Golf Course Extension Road, Gurugram. Static HTML, CSS and JS, no build step. Hosted on GitHub Pages with the custom domain godrejverano.org.

## Files

- `index.html` : the landing page (hero with form, stats, overview, highlights, price list, floor plans, amenities, specs, location with Google Map, micro market, payment plan, developer, FAQ, enquiry form, footer)
- `style.css`, `script.js` : styles and behaviour (mobile nav, form submit, popup)
- `privacy.html`, `disclaimer.html`, `404.html`
- `images/` : developer renders as responsive AVIF with WebP fallback (hero, master plan, towers, clubs, interiors, 3D floor plans)
- `robots.txt`, `sitemap.xml`, `llms.txt`, `favicon.svg`, `og.png`
- `vercel.json` : redirects, cache and security headers

## Enquiry form

Every form posts to `/api/enquiry`, a Vercel serverless function in `api/enquiry.js` that emails the enquiry to aaptdubey@godrejverano.org through the domain's own GoDaddy mailbox (SMTP). If that route is not configured or fails, the browser falls back to FormSubmit (`https://formsubmit.co/ajax/aaptdubey@godrejverano.org`), and if that also fails the visitor gets a WhatsApp button with the same details prefilled.

Set these in the Vercel project (Settings > Environment Variables, all environments), then redeploy:

| Variable | Value |
|---|---|
| `SMTP_USER` | aaptdubey@godrejverano.org |
| `SMTP_PASS` | the mailbox password |
| `SMTP_HOST` | optional, default smtpout.secureserver.net |
| `SMTP_PORT` | optional, default 465 |

FormSubmit, if ever used as the fallback, sends a one time activation email to the address on the first submission.

## DNS

godrejverano.org is on Cloudflare nameservers. The A records for the apex and the CNAME for www point at Vercel, as set in the Vercel project's Domains tab. Email for aaptdubey@godrejverano.org needs MX records on the same zone.

## Updating prices

Prices appear in: hero, stats strip, key facts, price table, floor plan cards, FAQ (page and JSON-LD), `llms.txt`, `og.png`. Search for `5.91` to find them all.
