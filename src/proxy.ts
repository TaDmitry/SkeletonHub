import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from '@config/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
	const response = intlMiddleware(request);

	//* прокидываем pathname для global-not-found.tsx
	response.headers.set('x-pathname', request.nextUrl.pathname);

	return response;
}

export const config = {
	matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
