import { getCollection } from "astro:content";
import { TIPS } from "../data/tips";

export async function GET() {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  // Raw site-root paths — the client applies the base path via withBase()
  const results = [
    ...posts.map((post) => ({
      type: "post",
      title: post.data.title,
      description: post.data.description,
      url: `/blog/${post.id}/`,
      category: post.data.category,
      tags: post.data.tags,
    })),
    ...TIPS.map((tip, i) => ({
      type: "tip",
      title: tip.title,
      description: tip.text,
      url: `/tips/#tip-${i + 1}`,
      category: "tip",
      tags: [tip.tag],
    })),
  ];

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}
