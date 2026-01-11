import Link from 'next/link';

export default function NotFound() {
	return (
		<div style={{ padding: '80px 24px', textAlign: 'center' }}>
			<h1>404</h1>
			<p>Страница не найдена</p>

			<Link href='/'>Вернуться на главную</Link>
		</div>
	);
}
