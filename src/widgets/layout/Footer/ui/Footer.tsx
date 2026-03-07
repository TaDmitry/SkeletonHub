'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { Link } from '@/shared/config/i18n/navigation';
import {
	NEWSLETTER_VALIDATION_MESSAGE_PREFIX,
	newsletterSchema,
	type NewsletterSchemaInput,
	type NewsletterSchemaValues,
} from '@/shared/lib/validation';
import { Button, Notification, Text, Title } from '@/shared/ui/index';
import { zodResolver } from '@hookform/resolvers/zod';

import styles from './Footer.module.scss';

export const FooterWidget = () => {
	const t = useTranslations('layout.footer.Footer');
	const tGlobal = useTranslations();
	const currentYear = new Date().getFullYear();
	const fieldId = useId();
	const messageId = `${fieldId}-message`;
	const [successToast, setSuccessToast] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<NewsletterSchemaInput, unknown, NewsletterSchemaValues>({
		resolver: zodResolver(newsletterSchema),
		mode: 'onTouched',
		defaultValues: {
			email: '',
		},
	});

	const resolveValidationMessage = (message?: string) => {
		if (!message) {
			return null;
		}

		if (message.startsWith(NEWSLETTER_VALIDATION_MESSAGE_PREFIX)) {
			return tGlobal(message);
		}

		return message;
	};

	const emailError = resolveValidationMessage(errors.email?.message);
	const hasEmailError = Boolean(emailError);

	const onSubmit = (_values: NewsletterSchemaValues) => {
		setSuccessToast(t('sections.newsletter.validation.success'));
		reset();
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
						<form
							className={styles.newsletterForm}
							noValidate
							onSubmit={handleSubmit(onSubmit)}
						>
							<label
								htmlFor={fieldId}
								className={styles.newsletterLabel}
							>
								{t('sections.newsletter.inputLabel')}
							</label>
							<input
								id={fieldId}
								type='email'
								className={styles.newsletterInput}
								placeholder={t('sections.newsletter.placeholder')}
								disabled={isSubmitting}
								autoComplete='email'
								inputMode='email'
								aria-invalid={hasEmailError}
								aria-describedby={emailError ? messageId : undefined}
								{...register('email', {
									onChange: () => {
										if (successToast) setSuccessToast(null);
									},
								})}
							/>
							<Button
								type='submit'
								text={t('sections.newsletter.button')}
								className={styles.subscribeButton}
								disabled={isSubmitting}
							/>
							{emailError && (
								<span
									id={messageId}
									className={styles.newsletterMessageError}
									role='alert'
									aria-live='assertive'
								>
									{emailError}
								</span>
							)}
						</form>
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

			{successToast ? (
				<Notification
					text={successToast}
					onClose={() => setSuccessToast(null)}
					duration={2200}
					className={styles.successNotification}
				/>
			) : null}
		</footer>
	);
};
