export type BlogItem = {
	id: string;
	title: string;
	short: string;
	href?: string;
};

export const BLOG_DATA: BlogItem[] = [
	{
		id: 'data-fetching',
		title: 'Data Fetching',
		short:
			'Make your React component async and await your data. Next.js supports both server and client data fetching.',
		href: '/blog/data-fetching',
	},
	{
		id: 'css-support',
		title: 'CSS Support',
		short:
			'Style your application with your favorite tools, including support for CSS Modules, Tailwind CSS, and popular community libraries.',
		href: '/blog/css-support',
	},
	{
		id: 'server-actions',
		title: 'Server Actions',
		short:
			'Run server code by calling a function. Skip the API. Then, easily revalidate cached data and update your UI in one network roundtrip.',
		href: '/blog/server-actions',
	},
	{
		id: 'route-handlers',
		title: 'Route Handlers',
		short:
			'Build API endpoints to securely connect with third-party services for handling auth or listening for webhooks.',
		href: '/blog/route-handlers',
	},
];
