import { getCollection } from "astro:content";

export async function GET() {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  // Raw site-root paths — the client applies the base path via withBase()
  const results = posts.map((post) => ({
    type: "post",
    title: post.data.title,
    description: post.data.description,
    url: `/blog/${post.id}/`,
    category: post.data.category,
    tags: post.data.tags,
    technologies: post.data.technologies,
  }));

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}
