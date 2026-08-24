import type { CollectionEntry } from "astro:content";

export interface PaginatedPage {
  data: CollectionEntry<"blog">[];
  currentPage: number;
  lastPage: number;
  url: { prev: string | undefined; next: string | undefined };
}

const PER_PAGE_BASE = "/blog";

export function buildPagination(
  posts: CollectionEntry<"blog">[],
  perPage: number,
): PaginatedPage[] {
  const lastPage = Math.max(1, Math.ceil(posts.length / perPage));
  const pages: PaginatedPage[] = [];

  for (let i = 1; i <= lastPage; i++) {
    const start = (i - 1) * perPage;
    pages.push({
      data: posts.slice(start, start + perPage),
      currentPage: i,
      lastPage,
      url: {
        prev:
          i === 2
            ? `${PER_PAGE_BASE}/`
            : i > 2
              ? `${PER_PAGE_BASE}/page/${i - 1}/`
              : undefined,
        next:
          i < lastPage ? `${PER_PAGE_BASE}/page/${i + 1}/` : undefined,
      },
    });
  }

  return pages;
}
