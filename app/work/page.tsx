import Link from "next/link";
import type { Metadata } from "next";

const pinioHref = "https://www.pinio-app.com/en";

export const metadata: Metadata = {
  title: "Work - Adrian Gruber",
  description: "Selected product work by Adrian Gruber.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work - Adrian Gruber",
    description: "Selected product work by Adrian Gruber.",
    url: "https://guba.studio/work",
  },
};

export default function WorkPage() {
  return (
    <main className="work-page">
      <header className="work-page-header">
        <Link href="/">Adrian Gruber</Link>
        <a href="mailto:hello@guba.studio">contact</a>
      </header>

      <section className="work-page-main" aria-labelledby="work-title">
        <h1 className="work-page-title" id="work-title">
          selected work
        </h1>

        <div className="work-list" aria-label="Selected products">
          <a className="work-row" href={pinioHref} rel="noreferrer" target="_blank">
            <span className="work-row-title">Pinio</span>
            <span className="work-row-desc">AI link organizer for saved TikToks, Reels, recipes, places, and videos.</span>
            <span className="work-row-year">2026</span>
          </a>
        </div>
      </section>
    </main>
  );
}
