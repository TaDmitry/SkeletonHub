'use client';

import React, { useState } from 'react';

import { Modal, Notification, Title } from '@shared/ui/';

import styles from './RootLayout.module.scss';

const DEFAULT_DURATION = 1000;
const LONG_DURATION = 5000;

type NotificationItem = {
	id: number;
	text: string;
	duration?: number;
};

let nextId = 1;

export default function Home() {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [text, setText] = useState('Привет!');
	const [duration, setDuration] = useState(DEFAULT_DURATION);

	// Modal
	const [isModalOpened, setIsModalOpened] = useState(false);
	const [modalWithBg, setModalWithBg] = useState(false);

	function show(textValue: string, durationValue?: number) {
		const item: NotificationItem = { id: nextId++, text: textValue, duration: durationValue };
		setNotifications((s) => [...s, item]);
	}

	function removeNotification(id: number) {
		setNotifications((s) => s.filter((n) => n.id !== id));
	}

	return (
		<div className={styles.playground}>
			<header className={styles.header}>
				<h1>UI Playground — app/page.tsx</h1>
				<p className={styles.lead}>Один ясный пример использования каждого компонента.</p>
			</header>

			<main className={styles.main}>
				<section className={styles.section}>
					<Title
						tag='h2'
						align='left'
					>
						Notification
					</Title>
					<div className={styles.exampleBox}>
						<div className={styles.exampleControls}>
							<input
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder='Текст уведомления'
							/>
							<input
								type='number'
								value={duration}
								onChange={(e) => setDuration(Number(e.target.value))}
							/>
							<button
								className={styles.btn}
								onClick={() => show(text, duration)}
							>
								Показать уведомление
							</button>
						</div>

						<div className={styles.exampleActions}>
							<button
								className={styles.btn}
								onClick={() => show('Демонстрация закрытия (5s)', LONG_DURATION)}
							>
								Показать длинное (5s)
							</button>
						</div>
					</div>
				</section>

				<section className={styles.section}>
					<Title
						tag='h2'
						align='left'
					>
						Modal
					</Title>
					<div className={styles.exampleBox}>
						<div className={styles.exampleControls}>
							<button
								className={styles.btn}
								onClick={() => {
									setModalWithBg(false);
									setIsModalOpened(true);
								}}
							>
								Открыть модал без фона
							</button>
							<button
								className={styles.btn}
								onClick={() => {
									setModalWithBg(true);
									setIsModalOpened(true);
								}}
							>
								Открыть модал с фоном
							</button>
						</div>
						<p className={styles.description}>
							Модал монтируется при <code>isModalOpened</code>. Для закрытия используется{' '}
							<code>setIsModalOpened(false)</code>. В демонстрации показан базовый кейс и вариант с
							затемнённым фоном.
						</p>
					</div>
				</section>
			</main>

			<div className={styles.notificationsLayer}>
				{notifications.map((n) => (
					<Notification
						key={n.id}
						text={n.text}
						duration={n.duration}
						onClose={() => removeNotification(n.id)}
					/>
				))}
			</div>

			{isModalOpened && (
				<Modal
					setIsModalOpened={setIsModalOpened}
					withBackground={modalWithBg}
				>
					<div style={{ padding: 16 }}>
						<h3>Пример модала</h3>
						<p>Текст внутри модала. Нажми кнопку ниже, чтобы закрыть.</p>
						<button
							className={styles.btn}
							onClick={() => setIsModalOpened(false)}
						>
							Закрыть
						</button>
					</div>
				</Modal>
			)}
		</div>
	);
}
