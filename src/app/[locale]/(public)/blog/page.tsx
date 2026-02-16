import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { resolveBlogLocale } from '@/entities/blog';
import {
	getAlternatesByLocale,
	getOpenGraphLocale,
	localizedAbsoluteUrl,
	SITE_NAME,
} from '@/shared/config/seo';
import { Title } from '@ui/index';
import { BlogPreviewGrid } from '@widgets/blog';

import styles from './page.module.scss';

type Props = {
	params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	const resolvedLocale = resolveBlogLocale(locale);
	const t = await getTranslations({
		locale: resolvedLocale,
		namespace: 'pages.blog.BlogPage',
	});

	const title = t('title');
	const description = t('description');
	const blogPath = '/blog';
	const blogUrl = localizedAbsoluteUrl(blogPath, resolvedLocale);

	return {
		title,
		description,
		alternates: {
			canonical: blogUrl,
			languages: getAlternatesByLocale(blogPath),
		},
		openGraph: {
			title,
			description,
			url: blogUrl,
			siteName: SITE_NAME,
			type: 'website',
			locale: getOpenGraphLocale(resolvedLocale),
		},
		twitter: {
			card: 'summary',
			title,
			description,
		},
	};
}

export default function BlogPage() {
	const t = useTranslations('pages.blog.BlogPage');

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<Title
					align='Left'
					className={styles.title}
				>
					{t('title')}
				</Title>
			</div>

			<BlogPreviewGrid />
		</div>
	);
}
