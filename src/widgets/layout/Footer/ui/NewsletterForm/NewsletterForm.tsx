'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { useFormErrorResolver } from '@/shared/lib/forms';
import {
	newsletterSchema,
	type NewsletterSchemaInput,
	type NewsletterSchemaValues,
} from '@/shared/lib/validation';
import { Button } from '@/shared/ui/index';
import { zodResolver } from '@hookform/resolvers/zod';

import styles from './NewsletterForm.module.scss';

interface NewsletterFormProps {
	onSuccess: () => void;
	onError: (error: string) => void;
}

export const NewsletterForm = ({ onSuccess, onError }: NewsletterFormProps) => {
	const t = useTranslations('layout.footer.Footer');
	const resolveValidationMessage = useFormErrorResolver();
	const fieldId = useId();
	const messageId = `${fieldId}-message`;

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

	const emailError = resolveValidationMessage(errors.email?.message);
	const hasEmailError = Boolean(emailError);

	const getErrorMessage = (status: number): string => {
		const errorMessages: Record<number, string | undefined> = {
			400: t('sections.newsletter.validation.error.400'),
			409: t('sections.newsletter.validation.error.409'),
			500: t('sections.newsletter.validation.error.500'),
		};

		return errorMessages[status] || t('sections.newsletter.validation.error.default');
	};

	const onSubmit = async (values: NewsletterSchemaValues) => {
		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: values.email }),
			});

			if (res.ok) {
				onSuccess();
				reset();
			} else {
				const errorMessage = getErrorMessage(res.status);
				onError(errorMessage);
			}
		} catch {
			onError(t('sections.newsletter.validation.error.default'));
		}
	};

	return (
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
				{...register('email')}
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
	);
};
