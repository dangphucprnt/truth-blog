import rss from '@astrojs/rss';
import {postPath,postTopic} from '../utils/blog.mjs';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	const sortedPosts = posts.sort(
		(a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
	);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: sortedPosts.map((post) => ({
			title: post.data.title || 'Không có tiêu đề',
			pubDate: post.data.pubDate,
			description: post.data.description || 'Chưa có mô tả cho bài viết này',
			link: postPath(post,posts),
            categories: [postTopic(post)],
		})),
	});
}
