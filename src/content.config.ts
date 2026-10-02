import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// CMS uploads use /blog-assets/...; existing source images remain supported.
            heroImage: z.union([z.string().regex(/^(?:\/(?!\/)|https?:\/\/)/), image()]).optional(),
            category: z.string().optional(),
            heroAlt: z.string().optional(),
            caption: z.string().optional(),
		}),
});

export const collections = { blog };
