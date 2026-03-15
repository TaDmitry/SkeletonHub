'use client';

import { useEffect, useReducer } from 'react';
import clsx from 'clsx';

import styles from './Notification.module.scss';

const AUTO_CLOSE_DELAY_MS = 1000;
const CLOSE_ANIMATION_DURATION_MS = 300;

interface NotificationProps {
	text: string;
	onClose: () => void;
	duration?: number;
	className?: string;
}

type NotificationState = 'mounting' | 'open' | 'closing' | 'closed';

type NotificationAction =
	| { type: 'MOUNT' }
	| { type: 'OPEN' }
	| { type: 'START_CLOSE' }
	| { type: 'FINISH_CLOSE' };

const notificationReducer = (
	state: NotificationState,
	action: NotificationAction
): NotificationState => {
	switch (action.type) {
		case 'MOUNT':
			return 'mounting';
		case 'OPEN':
			return state === 'mounting' ? 'open' : state;
		case 'START_CLOSE':
			return state === 'open' ? 'closing' : state;
		case 'FINISH_CLOSE':
			return 'closed';
		default:
			return state;
	}
};

export const Notification = ({
	text,
	onClose,
	duration = AUTO_CLOSE_DELAY_MS,
	className,
}: NotificationProps) => {
	const [state, dispatch] = useReducer(notificationReducer, 'mounting');

	useEffect(() => {
		const animationFrameId = window.requestAnimationFrame(() => {
			dispatch({ type: 'OPEN' });
		});

		return () => window.cancelAnimationFrame(animationFrameId);
	}, []);

	useEffect(() => {
		if (state !== 'open') {
			return () => {};
		}

		const closeAnimTimer = setTimeout(() => dispatch({ type: 'START_CLOSE' }), duration);

		const closeTimer = setTimeout(() => {
			dispatch({ type: 'FINISH_CLOSE' });
			onClose();
		}, duration + CLOSE_ANIMATION_DURATION_MS);

		return () => {
			clearTimeout(closeAnimTimer);
			clearTimeout(closeTimer);
		};
	}, [duration, state, onClose]);

	return (
		<div
			className={clsx(
				styles.notification,
				className,
				(state === 'open' || state === 'closing') && styles.open,
				state === 'closing' && styles.closing
			)}
			role='status'
			aria-live='polite'
			aria-atomic='true'
		>
			<p>{text}</p>
		</div>
	);
};
