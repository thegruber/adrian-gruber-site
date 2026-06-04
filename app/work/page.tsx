import Link from "next/link";
import type { Metadata } from "next";
import { WorkIndex } from "@/components/work-index";
import { workItems } from "@/components/work-data";

export const metadata: Metadata = {
  title: "Work - Adrian Gruber",
  description: "Selected product work by Adrian Gruber.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work - Adrian Gruber",
    description: "Selected product work by Adrian Gruber.",
    url: "https://adriangruber.com/work",
  },
};

export default function WorkPage() {
  return (
    <main className="work-page">
      <div className="work-page-field" aria-hidden="true" />
      <header className="work-page-header">
        <Link href="/">Adrian Gruber</Link>
        <a href="mailto:hello@adriangruber.com">contact</a>
      </header>

      <section className="work-page-main" aria-labelledby="work-title">
        <div className="work-page-copy">
          <h1 className="work-page-title" id="work-title">
            selected work
          </h1>
          <p className="work-page-intro">
            A tight public index of products I am actively building or shaping. Each entry stays compact until the work deserves a deeper page.
          </p>
        </div>

        <WorkIndex items={workItems} />
      </section>
    </main>
  );
}
