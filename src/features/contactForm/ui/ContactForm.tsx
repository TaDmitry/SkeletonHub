'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import { useFormErrorResolver } from '@/shared/lib/forms';
import { Button, Icon, Notification, Text, Title } from '@/shared/ui/index';

import { type ContactFormProps, useContactForm } from '../model';

import styles from './ContactForm.module.scss';

export const ContactForm: React.FC<ContactFormProps> = ({ className }) => {
	const t = useTranslations('features.contactForm.ContactForm');
	const resolveValidationMessage = useFormErrorResolver();
	const {
		closeToast,
		errors,
		handleSubmit,
		isFormDisabled,
		onSubmit,
		register,
		toast,
		trackFirstInteraction,
	} = useContactForm({
		successToastText: t('toast.success'),
		errorToastText: t('toast.error'),
	});

	const nameError = resolveValidationMessage(errors.name?.message);
	const emailError = resolveValidationMessage(errors.email?.message);
	const telegramError = resolveValidationMessage(errors.telegram?.message);
	const messageError = resolveValidationMessage(errors.message?.message);

	return (
		<>
			<section className={clsx(styles.contactForm, className)}>
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
					onFocusCapture={trackFirstInteraction}
					onInputCapture={trackFirstInteraction}
					suppressHydrationWarning
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
								suppressHydrationWarning
								placeholder={t('fields.name.placeholder')}
								autoComplete='name'
								disabled={isFormDisabled}
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
								suppressHydrationWarning
								placeholder={t('fields.telegram.placeholder')}
								autoComplete='username'
								disabled={isFormDisabled}
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
								suppressHydrationWarning
								placeholder={t('fields.email.placeholder')}
								autoComplete='email'
								disabled={isFormDisabled}
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
							suppressHydrationWarning
							placeholder={t('fields.message.placeholder')}
							disabled={isFormDisabled}
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
							text={isFormDisabled ? t('buttons.submitting') : t('buttons.submit')}
							className={styles.submitButton}
							disabled={isFormDisabled}
						/>
					</div>
				</form>
			</section>

			{toast ? (
				<Notification
					key={toast.id}
					text={toast.text}
					onClose={closeToast}
					duration={2500}
					className={styles.toast}
				/>
			) : null}
		</>
	);
};
