'use client';

import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
	contactSchema,
	type ContactSchemaInput,
	type ContactSchemaValues,
} from '@/shared/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';

import { sendContactForm } from '../api';
import { createContactApiPayload } from '../lib';

type UseContactFormParams = {
	successToastText: string;
	errorToastText: string;
};

type ContactFormToast = {
	id: number;
	text: string;
};

export function useContactForm({ successToastText, errorToastText }: UseContactFormParams) {
	const [toast, setToast] = useState<ContactFormToast | null>(null);
	const [isRequestInFlight, setIsRequestInFlight] = useState(false);
	const firstInteractionStartedAtRef = useRef<number | null>(null);
	const toastIdRef = useRef(0);
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
	const isFormDisabled = isSubmitting || isRequestInFlight;

	const trackFirstInteraction = () => {
		if (firstInteractionStartedAtRef.current === null) {
			firstInteractionStartedAtRef.current = Date.now();
		}
	};

	const showToast = useCallback((text: string) => {
		toastIdRef.current += 1;
		setToast({
			id: toastIdRef.current,
			text,
		});
	}, []);

	const closeToast = useCallback(() => {
		setToast(null);
	}, []);

	const onSubmit = useCallback(
		async (values: ContactSchemaValues) => {
			const payload = await createContactApiPayload(values, firstInteractionStartedAtRef.current);

			setIsRequestInFlight(true);

			try {
				const submitResult = await sendContactForm(payload);

				if (!submitResult.success) {
					if (submitResult.error) {
						console.error('[contact-form] Contact form submission failed.', submitResult.error);
					} else {
						console.error('[contact-form] Contact API request failed.', {
							status: submitResult.status,
							apiResult: submitResult.apiResult,
							error: submitResult.apiResult?.error,
						});
					}

					showToast(errorToastText);

					return;
				}

				reset();
				firstInteractionStartedAtRef.current = null;
				showToast(successToastText);
			} finally {
				setIsRequestInFlight(false);
			}
		},
		[successToastText, errorToastText, reset, showToast]
	);

	return {
		register,
		handleSubmit,
		errors,
		isFormDisabled,
		trackFirstInteraction,
		toast,
		closeToast,
		onSubmit,
	};
}
