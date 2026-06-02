# Adrian Gruber Site

Public personal website for Adrian Gruber.

## Purpose

- Keep this site premium, fast, and low maintenance.
- Use it as Adrian's personal homepage and selected-work surface.
- Keep private drafts, queues, analytics, prompts, and content operations in `personal/adrian-gruber`, not this repo.
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

- Intended Vercel project: `adrian-gruber-site`
- Intended primary domain: `adriangruber.com`
- Do not deploy this repo to the old `guba-studio-site` Vercel project.

## Rules

- Keep the homepage personal. Do not turn it into the Guba Studio homepage.
- Use the code-native signal/pattern system for visual identity. Do not copy reference sites or Framer templates.
- Keep motion quiet and purposeful. Respect `prefers-reduced-motion`.
- Do not add GSAP, Framer, or extra animation libraries unless a future page has a clear need.
- No secrets or app credentials in this folder.
- Keep security headers in `vercel.json`.
- Update `public/sitemap.xml` if public routes change.
