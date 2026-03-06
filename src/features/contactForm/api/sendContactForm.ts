import type { ContactApiPayload, ContactApiResponse } from '../model/types';

type SendContactFormResult =
	| { success: true }
	| { success: false; status?: number; apiResult?: ContactApiResponse | null; error?: unknown };

async function parseApiResponse(response: Response): Promise<ContactApiResponse | null> {
	try {
		return (await response.json()) as ContactApiResponse;
	} catch {
		return null;
	}
}

export async function sendContactForm(payload: ContactApiPayload): Promise<SendContactFormResult> {
	try {
		const response = await fetch('/api/contact', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		const apiResult = await parseApiResponse(response);

		if (!response.ok || !apiResult?.success) {
			return {
				success: false,
				status: response.status,
				apiResult,
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		return {
			success: false,
			error,
		};
	}
}

export type { SendContactFormResult };
