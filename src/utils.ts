const RAW_BASE = import.meta.env.BASE_URL;
const BASE = RAW_BASE.endsWith("/") ? RAW_BASE : `${RAW_BASE}/`;

export function withBase(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${BASE}${cleanPath}`;
}

export function getReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface TagStat {
  slug: string;
  name: string;
  count: number;
}

export function collectTechnologies(
  posts: { data: { technologies?: string[] } }[],
): TagStat[] {
  const counts = new Map<string, TagStat>();
  for (const post of posts) {
    for (const tech of post.data.technologies ?? []) {
      const slug = slugify(tech);
      const existing = counts.get(slug);
      if (existing) existing.count += 1;
      else counts.set(slug, { slug, name: tech, count: 1 });
    }
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}
