'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/shared/config/i18n/navigation';
import { Notification, Text, Title } from '@/shared/ui/index';

import { NewsletterForm } from './NewsletterForm';

import styles from './Footer.module.scss';

interface Toast {
	type: 'success' | 'error';
	message: string;
}

export const FooterWidget = () => {
	const t = useTranslations('layout.footer.Footer');
	const currentYear = new Date().getFullYear();
	const [toast, setToast] = useState<Toast | null>(null);

	const handleNewsletterSuccess = () => {
		setToast({
			type: 'success',
			message: t('sections.newsletter.validation.success'),
		});
	};

	const handleNewsletterError = (error: string) => {
		setToast({
			type: 'error',
			message: error,
		});
	};

	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={styles.sections}>
						<section className={styles.section}>
							<Title
								tag='h3'
								align='Left'
								className={styles.sectionTitle}
							>
								{t('sections.documentation')}
							</Title>
							<ul className={styles.linkList}>
								<li>
									<Link
										href='/docs'
										className={styles.link}
									>
										{t('links.documentation')}
									</Link>
								</li>
								<li>
									<Link
										href='/blog'
										className={styles.link}
									>
										{t('links.news')}
									</Link>
								</li>
							</ul>
						</section>

						<section className={styles.section}>
							<Title
								tag='h3'
								align='Left'
								className={styles.sectionTitle}
							>
								{t('sections.products')}
							</Title>
							<ul className={styles.linkList}>
								<li>
									<Link
										href='/team'
										className={styles.link}
									>
										{t('links.team')}
									</Link>
								</li>
								<li>
									<Link
										href='/analytics'
										className={styles.link}
									>
										{t('links.analytics')}
									</Link>
								</li>
								<li>
									<Link
										href='/governance'
										className={styles.link}
									>
										{t('links.governance')}
									</Link>
								</li>
							</ul>
						</section>

						<section className={styles.section}>
							<Title
								tag='h3'
								align='Left'
								className={styles.sectionTitle}
							>
								{t('sections.support')}
							</Title>
							<ul className={styles.linkList}>
								<li>
									<Link
										href='/contact'
										className={styles.link}
									>
										{t('links.feedback')}
									</Link>
								</li>
								<li>
									<Link
										href='/support-policy'
										className={styles.link}
									>
										{t('links.supportPolicy')}
									</Link>
								</li>
								<li>
									<a
										href='https://github.com/TaDmitry/SkeletonHub'
										target='_blank'
										rel='noopener noreferrer'
										className={styles.link}
									>
										{t('links.github')}
									</a>
								</li>
								<li>
									<Link
										href='/privacy-policy'
										className={styles.link}
									>
										{t('links.privacyPolicy')}
									</Link>
								</li>
							</ul>
						</section>
					</div>

					<section className={styles.newsletter}>
						<Title
							tag='h3'
							align='Left'
							className={styles.newsletterTitle}
						>
							{t('sections.newsletter.title')}
						</Title>
						<Text
							align='Left'
							className={styles.newsletterDescription}
						>
							{t('sections.newsletter.description')}
						</Text>
						<NewsletterForm
							onSuccess={handleNewsletterSuccess}
							onError={handleNewsletterError}
						/>
					</section>
				</div>

				<Text
					align='Left'
					as='span'
					className={styles.copyright}
				>
					{t('copyright', { year: currentYear })}
				</Text>
			</div>

			{toast ? (
				<Notification
					text={toast.message}
					onClose={() => setToast(null)}
					duration={2200}
					className={styles.successNotification}
				/>
			) : null}
		</footer>
	);
};
