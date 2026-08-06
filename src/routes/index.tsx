import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - JSX module without type declarations
import HellhoundTerminal from "@/components/HellhoundTerminal.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hellhound Terminal — Social Engineering Text Analysis" },
      {
        name: "description",
        content:
          "Analyze text samples for persuasion, urgency, and manipulation signals with readability, lexicon, and Cialdini principle scoring.",
      },
      { property: "og:title", content: "Hellhound Terminal — Text Manipulation Analysis" },
      {
        property: "og:description",
        content:
          "Security-research console for scoring persuasive and manipulative language in text samples.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HellhoundTerminal,
});
