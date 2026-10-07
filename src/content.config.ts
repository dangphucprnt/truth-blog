import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const normalizeCategory = (value: unknown) => {
    const key = (Array.isArray(value) ? value.join(' ') : String(value ?? 'auto'))
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (['iphone-cong-nghe', 'iphone', 'cong-nghe'].includes(key)) return 'iphone-cong-nghe';
    if (['ca-phe', 'cafe', 'coffee'].includes(key)) return 'ca-phe';
    if (['3d-tech', '3d', 'cong-nghe-3d'].includes(key)) return '3d-tech';
    if (['xa-hoi', 'social', 'society'].includes(key)) return 'xa-hoi';
    return 'auto';
};

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
            category: z.preprocess(normalizeCategory, z.enum(['auto','iphone-cong-nghe','ca-phe','3d-tech','xa-hoi'])),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
            heroAlt: z.string().optional(),
            heroCaption: z.string().optional(),
            gallery: z.array(z.object({
                src: z.string().regex(/^(?:https:\/\/[^\s]+|\/(?!\/)[^\s]+)$/, 'Dùng link HTTPS hoặc đường dẫn /blog-assets/...'),
                alt: z.string().optional(),
                caption: z.string().optional(),
            })).max(6, 'Bộ sưu tập tối đa 6 ảnh').optional(),
		}),
});

export const collections = { blog };
