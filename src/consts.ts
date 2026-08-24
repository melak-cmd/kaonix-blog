export const SITE_TITLE = "Kaonix Blog";
export const SITE_DESCRIPTION =
  "IT tutorials, best practices, and the latest news in technology.";
export const SITE_URL = "https://kaonix.blog.local";

export const CATEGORIES = {
  tutorials: {
    name: "Tutorials",
    description: "Step-by-step guides to master new tools and technologies.",
    icon: "📚",
  },
  "best-practices": {
    name: "Best Practices",
    description:
      "Proven patterns, conventions, and tips for writing better software.",
    icon: "✅",
  },
  news: {
    name: "Tech News",
    description: "The latest happenings and trends in the tech world.",
    icon: "📰",
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
