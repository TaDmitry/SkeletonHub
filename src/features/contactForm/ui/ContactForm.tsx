'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';

import {
	CONTACT_VALIDATION_MESSAGE_PREFIX,
	contactSchema,
	type ContactSchemaInput,
	type ContactSchemaValues,
} from '@/shared/lib/validation/contact.schema';
import { Button, Icon, Notification, Text, Title } from '@/shared/ui/index';
import { zodResolver } from '@hookform/resolvers/zod';

import styles from './ContactForm.module.scss';

type ContactApiResponse = {
	success: boolean;
	error?: string;
};

type ContactFormProps = {
	className?: string;
};

async function parseApiResponse(response: Response): Promise<ContactApiResponse | null> {
	try {
		return (await response.json()) as ContactApiResponse;
	} catch {
		return null;
	}
}

export const ContactForm: React.FC<ContactFormProps> = ({ className }) => {
	const t = useTranslations('features.contactForm.ContactForm');
	const tGlobal = useTranslations();
	const [toastText, setToastText] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ContactSchemaInput, unknown, ContactSchemaValues>({
		resolver: zodResolver(contactSchema),
		mode: 'onTouched',
		defaultValues: {
			name: '',
			email: '',
			telegram: '',
			message: '',
		},
	});

	const onSubmit = async (values: ContactSchemaValues) => {
		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(values),
			});

			const apiResult = await parseApiResponse(response);

			if (!response.ok || !apiResult?.success) {
				setToastText(t('toast.error'));

				return;
			}

			reset();
			setToastText(t('toast.success'));
		} catch {
			setToastText(t('toast.error'));
		}
	};

	const resolveValidationMessage = (message?: string) => {
		if (!message) {
			return null;
		}

		if (message.startsWith(CONTACT_VALIDATION_MESSAGE_PREFIX)) {
			return tGlobal(message);
		}

		return message;
	};

	const nameError = resolveValidationMessage(errors.name?.message);
	const emailError = resolveValidationMessage(errors.email?.message);
	const telegramError = resolveValidationMessage(errors.telegram?.message);
	const messageError = resolveValidationMessage(errors.message?.message);

	return (
		<>
			<section className={clsx(styles.contactForm, className)}>
				<div className={styles.meta}>
					<Title
						tag='h3'
						align='Left'
						className={styles.metaDescription}
					>
						{t('meta.description')}
					</Title>
				</div>

				<header className={styles.header}>
					<Title
						tag='h3'
						align='Left'
						className={styles.title}
					>
						{t('title')}
					</Title>

					<Text
						align='Left'
						className={styles.description}
					>
						{t('description')}
					</Text>
				</header>

				<form
					className={styles.form}
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<div className={styles.field}>
						<div className={clsx(styles.inputShell, nameError && styles.invalid)}>
							<Icon
								icon='Person'
								size={18}
								className={styles.inputIcon}
							/>
							<input
								id='contact-name'
								className={styles.input}
								placeholder={t('fields.name.placeholder')}
								disabled={isSubmitting}
								aria-invalid={Boolean(errors.name)}
								aria-describedby={nameError ? 'contact-name-error' : undefined}
								{...register('name')}
							/>
						</div>
						{nameError ? (
							<Text
								id='contact-name-error'
								as='span'
								className={styles.errorText}
							>
								{nameError}
							</Text>
						) : null}

						<label
							htmlFor='contact-telegram'
							className={styles.label}
						>
							{t('fields.telegram.label')}
						</label>
						<div className={clsx(styles.inputShell, telegramError && styles.invalid)}>
							<Icon
								icon='Telegram'
								size={18}
								className={styles.inputIcon}
							/>
							<input
								id='contact-telegram'
								className={styles.input}
								placeholder={t('fields.telegram.placeholder')}
								disabled={isSubmitting}
								aria-invalid={Boolean(errors.telegram)}
								aria-describedby={telegramError ? 'contact-telegram-error' : undefined}
								{...register('telegram')}
							/>
						</div>
						{telegramError ? (
							<Text
								id='contact-telegram-error'
								as='span'
								className={styles.errorText}
							>
								{telegramError}
							</Text>
						) : null}
					</div>

					<div className={styles.field}>
						<label
							htmlFor='contact-email'
							className={styles.label}
						>
							{t('fields.email.label')}
						</label>
						<div className={clsx(styles.inputShell, emailError && styles.invalid)}>
							<Icon
								icon='Mail'
								size={18}
								className={styles.inputIcon}
							/>
							<input
								id='contact-email'
								type='email'
								className={styles.input}
								placeholder={t('fields.email.placeholder')}
								disabled={isSubmitting}
								aria-invalid={Boolean(errors.email)}
								aria-describedby={emailError ? 'contact-email-error' : undefined}
								{...register('email')}
							/>
						</div>
						{emailError ? (
							<Text
								id='contact-email-error'
								as='span'
								className={styles.errorText}
							>
								{emailError}
							</Text>
						) : null}
					</div>

					<div className={styles.field}>
						<label
							htmlFor='contact-message'
							className={styles.label}
						>
							{t('fields.message.label')}
						</label>
						<textarea
							id='contact-message'
							className={clsx(styles.textarea, errors.message && styles.invalid)}
							placeholder={t('fields.message.placeholder')}
							disabled={isSubmitting}
							aria-invalid={Boolean(errors.message)}
							aria-describedby={messageError ? 'contact-message-error' : undefined}
							{...register('message')}
						/>
						{messageError ? (
							<Text
								id='contact-message-error'
								as='span'
								className={styles.errorText}
							>
								{messageError}
							</Text>
						) : null}
					</div>

					<div className={styles.actionsRow}>
						<Button
							type='submit'
							text={isSubmitting ? t('buttons.submitting') : t('buttons.submit')}
							className={styles.submitButton}
							disabled={isSubmitting}
						/>
					</div>
				</form>
			</section>

			{toastText ? (
				<Notification
					text={toastText}
					onClose={() => setToastText(null)}
					duration={2500}
				/>
			) : null}
		</>
	);
};
