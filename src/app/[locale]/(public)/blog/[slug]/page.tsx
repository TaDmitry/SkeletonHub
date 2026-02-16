import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getAllBlogPostSlugs, getBlogPostBySlug, resolveBlogLocale } from '@/entities/blog';
import { routing } from '@/shared/config/i18n/routing';
import {
	getAlternatesByLocale,
	getOpenGraphLocale,
	localizedAbsoluteUrl,
	SITE_NAME,
} from '@/shared/config/seo';
import { formatDate } from '@/shared/lib/date';
import { Button, Icon, Text, Title } from '@ui/index';

import styles from './page.module.scss';

type RouteParams = {
	locale: string;
	slug: string;
};

type Props = {
	params: Promise<RouteParams>;
};

export const dynamicParams = false;

export function generateStaticParams() {
	const slugs = getAllBlogPostSlugs();

	return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, slug } = await params;
	const resolvedLocale = resolveBlogLocale(locale);
	const post = getBlogPostBySlug(slug, resolvedLocale);
	const postPath = `/blog/${slug}`;
	const postUrl = localizedAbsoluteUrl(postPath, resolvedLocale);
	const alternatesByLocale = getAlternatesByLocale(postPath);

	if (post) {
		const publishedTime = new Date(`${post.date}T00:00:00.000Z`).toISOString();
		const modifiedTime = new Date(`${post.updatedAt ?? post.date}T00:00:00.000Z`).toISOString();

		return {
			title: post.title,
			description: post.excerpt,
			alternates: {
				canonical: postUrl,
				languages: alternatesByLocale,
			},
			openGraph: {
				title: post.title,
				description: post.excerpt,
				url: postUrl,
				siteName: SITE_NAME,
				type: 'article',
				locale: getOpenGraphLocale(resolvedLocale),
				publishedTime,
				modifiedTime,
			},
			twitter: {
				card: 'summary',
				title: post.title,
				description: post.excerpt,
			},
		};
	}

	const t = await getTranslations({
		locale: resolvedLocale,
		namespace: 'pages.blog.BlogPostNotFound',
	});

	return {
		title: t('title'),
		description: t('description'),
		robots: { index: false, follow: true },
		alternates: {
			canonical: postUrl,
			languages: alternatesByLocale,
		},
		openGraph: {
			title: t('title'),
			description: t('description'),
			url: postUrl,
			siteName: SITE_NAME,
			type: 'website',
			locale: getOpenGraphLocale(resolvedLocale),
		},
		twitter: {
			card: 'summary',
			title: t('title'),
			description: t('description'),
		},
	};
}

export default async function BlogPostPage({ params }: Props) {
	const { locale, slug } = await params;
	const resolvedLocale = resolveBlogLocale(locale);
	const post = getBlogPostBySlug(slug, resolvedLocale);
	const t = await getTranslations({
		locale: resolvedLocale,
		namespace: 'pages.blog.BlogPostPage',
	});

	if (!post) {
		notFound();
	}

	const formatted = formatDate(post.date, 'long', resolvedLocale);
	const articleUrl = localizedAbsoluteUrl(`/blog/${post.slug}`, resolvedLocale);
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		'headline': post.title,
		'description': post.excerpt,
		'datePublished': post.date,
		'dateModified': post.updatedAt ?? post.date,
		'inLanguage': resolvedLocale,
		'mainEntityOfPage': articleUrl,
		'publisher': {
			'@type': 'Organization',
			'name': SITE_NAME,
		},
	};

	return (
		<div className={styles.page}>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<Button
				href='/blog'
				className={styles.back}
				text={t('backButton')}
				icon={
					<Icon
						icon='ArrowBack'
						className={styles.icon}
					/>
				}
			/>

			<article className={styles.card}>
				<div className={styles.header}>
					<time
						className={styles.date}
						dateTime={post.date}
					>
						<p>{formatted}</p>
					</time>
					<Title
						align='Left'
						className={styles.title}
					>
						{post.title}
					</Title>
				</div>

				<div className={styles.content}>
					{post.content.map((p, idx) => (
						<Text
							key={`${post.slug}-${idx}`}
							className={styles.paragraph}
						>
							{p}
						</Text>
					))}
				</div>
			</article>
		</div>
	);
}
