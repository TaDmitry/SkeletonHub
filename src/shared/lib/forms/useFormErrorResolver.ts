import { useTranslations } from 'next-intl';

export const useFormErrorResolver = () => {
	const t = useTranslations();

	return (message?: string | null): string | null => {
		if (!message) {
			return null;
		}

		if (message.startsWith('validation.')) {
			return t(message);
		}

		return message;
	};
};
