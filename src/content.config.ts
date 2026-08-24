import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(["tutorials", "best-practices", "news"]),
    tags: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    author: z.string().default("Kaonix Team"),
    source: z.string().url().optional(),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(),
  }),
});

export const collections = { blog };
