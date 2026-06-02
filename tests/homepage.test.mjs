import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

const packageJson = JSON.parse(read("package.json"));
const layout = read("app/layout.tsx");
const page = read("app/page.tsx");
const workPage = read("app/work/page.tsx");
const home = read("components/studio-home.tsx");
const motionProvider = read("components/motion-provider.tsx");
const reducedMotionHook = read("components/use-client-reduced-motion.ts");
const globals = read("app/globals.css");
const vercel = read("vercel.json");
const sitemap = read("public/sitemap.xml");

test("Next app uses the selected premium stack", () => {
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.dev, "next dev");
  assert.ok(packageJson.dependencies.next);
  assert.ok(packageJson.dependencies.motion);
  assert.ok(packageJson.dependencies.lenis);
  assert.ok(packageJson.devDependencies.tailwindcss);
  assert.ok(packageJson.devDependencies["@tailwindcss/postcss"]);
  assert.equal(packageJson.overrides.postcss, "^8.5.15");
});

test("App Router metadata and fonts are configured", () => {
  assert.match(layout, /export const metadata/);
  assert.match(layout, /metadataBase:\s*new URL\("https:\/\/guba\.studio"\)/);
  assert.match(layout, /canonical:\s*"\/"/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /title:\s*"Adrian Gruber"/);
  assert.match(layout, /icons/);
  assert.match(layout, /favicon\.svg/);
  assert.match(layout, /Geist/);
  assert.match(layout, /DM_Mono/);
  assert.match(layout, /localFont/);
  assert.match(layout, /DepartureMono-Regular\.woff2/);
  assert.match(page, /StudioHome/);
});

test("homepage renders personal copy and one-screen personal surface", () => {
  assert.match(home, /I design and build small, useful products with a focus on feel/);
  assert.match(home, /Currently building Pinio, plus small experiments through guba\.studio/);
  assert.match(home, /className="smile-mark"/);
  assert.match(home, /design \/ code \/ products/);
  assert.doesNotMatch(home, /distribution|craft systems|studio index|pinio index/i);
  assert.match(home, /work/);
  assert.match(home, /contact/);
  assert.match(home, /Pinio/);
  assert.match(home, /guba\.studio/);
  assert.match(home, /Barcelona/);
  assert.doesNotMatch(home, /Madrid \/ 2026/);
  assert.match(home, /mailto:hello@guba\.studio/);
  assert.match(home, /className="cursor-link"/);
  assert.match(home, /href=\{workHref\}/);
  assert.match(home, /SignatureMark/);
  assert.match(home, /WorkPreview/);
  assert.match(home, /reveal-clip/);
  assert.doesNotMatch(home, /pixel-work/);
  assert.doesNotMatch(home, /DotMatrixSignature/);
  assert.doesNotMatch(home, /never have i ever|consumer app scout|private experiments/i);
  assert.doesNotMatch(home, /SignalBoard|WorkPattern/);
  assert.doesNotMatch(home, /founder|solo/);
});

test("motion system uses Lenis, Motion, and reduced-motion fallbacks", () => {
  assert.match(motionProvider, /new Lenis/);
  assert.match(motionProvider, /prefers-reduced-motion:\s*reduce/);
  assert.match(home, /useMotionValue/);
  assert.match(home, /useSpring/);
  assert.match(home, /useClientReducedMotion/);
  assert.match(reducedMotionHook, /matchMedia\("\(prefers-reduced-motion:\s*reduce\)"\)/);
  assert.match(home, /onPointerMove/);
  assert.match(home, /onPointerDown/);
  assert.match(home, /cursorSpring/);
  assert.match(home, /cursorStretched/);
  assert.match(home, /pulseCursor/);
  assert.match(home, /magneticSnap/);
  assert.match(home, /getBoundingClientRect/);
  assert.match(home, /soft-cursor/);
  assert.match(home, /soft-cursor-target/);
  assert.doesNotMatch(home, /soft-cursor-dot/);
  assert.match(globals, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test("Tailwind tokens and deployment assets are preserved", () => {
  assert.match(globals, /@import "tailwindcss"/);
  assert.match(globals, /--color-paper:/);
  assert.match(globals, /--color-accent:/);
  assert.match(globals, /--font-main:/);
  assert.match(globals, /\.home-canvas/);
  assert.match(globals, /\.personal-frame[\s\S]*height:\s*100svh/);
  assert.match(globals, /\.personal-hero/);
  assert.match(globals, /\.cursor-link/);
  assert.match(globals, /\.reveal-clip/);
  assert.match(globals, /\.signature-dots/);
  assert.match(globals, /\.work-peek/);
  assert.match(globals, /\.work-page/);
  assert.match(globals, /\.work-row/);
  assert.doesNotMatch(globals, /\.pixel-work/);
  assert.doesNotMatch(globals, /\.dot-signature/);
  assert.doesNotMatch(globals, /@keyframes dot-breathe/);
  assert.doesNotMatch(globals, /\.work-object/);
  assert.doesNotMatch(globals, /\.cloud-stage/);
  assert.doesNotMatch(globals, /\.cloud-art/);
  assert.doesNotMatch(globals, /\.personal-work-link/);
  assert.match(globals, /\.soft-cursor/);
  assert.match(globals, /mix-blend-mode:\s*difference/);
  assert.match(globals, /\.soft-cursor-target[\s\S]*background:\s*rgb\(255 255 255 \/ 90%\)/);
  assert.doesNotMatch(globals, /\.soft-cursor-dot/);
  assert.doesNotMatch(globals, /\.soft-cursor-open/);
  assert.doesNotMatch(globals, /\.soft-cursor-link/);
  assert.doesNotMatch(globals, /\.hero-stage::before/);
  assert.doesNotMatch(globals, /\.black-footer::before/);
  assert.doesNotMatch(globals, /\.footer-line/);
  assert.match(globals, /\.slash-mark[\s\S]*font-family:\s*var\(--font-departure-mono\)/);
  assert.match(globals, /\.smile-mark[\s\S]*font-family:\s*var\(--font-departure-mono\)/);
  assert.match(sitemap, /https:\/\/guba\.studio\/work/);
  assert.match(vercel, /Content-Security-Policy/);
  assert.match(vercel, /X-Frame-Options/);
  assert.ok(existsSync(join(root, "public/robots.txt")));
  assert.ok(existsSync(join(root, "public/sitemap.xml")));
  assert.ok(existsSync(join(root, "public/favicon.svg")));
  assert.ok(existsSync(join(root, "public/legal/never-have-i-ever/privacy.html")));
});

test("work route lists Pinio as the only selected product", () => {
  assert.match(workPage, /export const metadata/);
  assert.match(workPage, /canonical:\s*"\/work"/);
  assert.match(workPage, /selected work/);
  assert.match(workPage, /Pinio/);
  assert.match(workPage, /AI link organizer/);
  assert.match(workPage, /https:\/\/www\.pinio-app\.com\/en/);
  assert.match(workPage, /mailto:hello@guba\.studio/);
  assert.doesNotMatch(workPage, /Never Have I Ever|consumer app scout|studio index/i);
});
