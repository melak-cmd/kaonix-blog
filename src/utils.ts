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
