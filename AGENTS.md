# guba studio site

Public web home for `guba.studio`.

## Purpose

- Keep this site premium, fast, and low maintenance.
- Use it as the canonical studio domain for portfolio links, legal pages, and future app cross-promotion.
- Do not deploy the repository root to Vercel. Deploy only this folder.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Motion for React component and scroll-linked animation
- Lenis for weighted smooth scrolling
- DM Mono via `next/font/google`
- Departure Mono self-hosted from `fonts/departure-mono/`

## Deployment

- Vercel project: `guba-studio-site`
- Primary domain: `guba.studio`
- DNS should be authoritative in Vercel once nameservers are switched from Hostinger to:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`

## Rules

- Keep the homepage brand-only. Do not add founder-name or personal-brand copy to the homepage.
- Use the code-native signal/pattern system for visual identity. Do not copy reference sites or Framer templates.
- Keep motion quiet and purposeful. Respect `prefers-reduced-motion`.
- Do not add GSAP, Framer, or extra animation libraries unless a future page has a clear need.
- No secrets or app credentials in this folder.
- Keep security headers in `vercel.json`.
- Update `public/sitemap.xml` if public routes change.
