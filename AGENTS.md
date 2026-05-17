# guba studio site

Public web home for `guba.studio`.

## Purpose

- Keep this site tiny, fast, and low maintenance.
- Use it as the canonical studio domain for portfolio links, legal pages, and future app cross-promotion.
- Do not deploy the repository root to Vercel. Deploy only this folder.

## Deployment

- Vercel project: `guba-studio-site`
- Primary domain: `guba.studio`
- DNS should be authoritative in Vercel once nameservers are switched from Hostinger to:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`

## Rules

- Static-first. No framework unless there is a real product need.
- No secrets or app credentials in this folder.
- Keep security headers in `vercel.json`.
- Update `sitemap.xml` if public routes change.
