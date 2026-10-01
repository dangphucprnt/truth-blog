import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	// Sắp xếp bài viết mới nhất lên đầu mà không lọc bỏ bài
	const sortedPosts = posts.sort(
		(a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
	);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: sortedPosts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/blog/${post.slug}/`,
		})),
	});
}