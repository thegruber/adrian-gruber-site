export type WorkAccent = "acid" | "blue";

export type WorkItem = {
  accent: WorkAccent;
  cta: string;
  description: string;
  detail: string;
  focus: string;
  href?: string;
  id: string;
  index: string;
  meta: string;
  role: string;
  signals: string[];
  status: string;
  title: string;
  year: string;
};

export const workItems: WorkItem[] = [
  {
    accent: "acid",
    cta: "open site",
    description: "AI link organizer for saved TikToks, Reels, recipes, places, and videos.",
    detail: "A consumer product for turning scattered saved links into something searchable and useful later.",
    focus: "Capture, classification, recall",
    href: "https://www.pinio-app.com/en",
    id: "pinio",
    index: "01",
    meta: "consumer productivity",
    role: "Design, frontend, AI workflow",
    signals: ["Saved-link collection", "AI organization", "Mobile-first retrieval"],
    status: "building",
    title: "Pinio",
    year: "2026",
  },
  {
    accent: "blue",
    cta: "preview soon",
    description: "AI link preview and inspection tool for understanding pages before opening them.",
    detail: "A lightweight inspection surface for deciding whether a link is worth opening.",
    focus: "Preview, risk, context",
    id: "linkpeek",
    index: "02",
    meta: "link intelligence",
    role: "Product system, prototype",
    signals: ["Page summaries", "Intent checks", "Link triage"],
    status: "preview",
    title: "Linkpeek",
    year: "2026",
  },
];
