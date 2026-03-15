export const CONTACT_FORM_VALIDATION_CONFIG = {
	name: { min: 2, max: 80 },
	email: { max: 160 },
	telegram: { max: 32 },
	message: { min: 6, max: 2000 },
} as const;
