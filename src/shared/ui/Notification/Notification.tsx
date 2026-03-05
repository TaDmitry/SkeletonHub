'use client';

import { useEffect, useState } from 'react';
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

export const Notification = ({
	text,
	onClose,
	duration = AUTO_CLOSE_DELAY_MS,
	className,
}: NotificationProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		const animationFrameId = window.requestAnimationFrame(() => {
			setIsOpen(true);
		});

		return () => window.cancelAnimationFrame(animationFrameId);
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return () => {};
		}

		const closeAnimTimer = setTimeout(() => setIsClosing(true), duration);

		const closeTimer = setTimeout(() => onClose(), duration + CLOSE_ANIMATION_DURATION_MS);

		return () => {
			clearTimeout(closeAnimTimer);
			clearTimeout(closeTimer);
		};
	}, [duration, isOpen, onClose]);

	return (
		<div
			className={clsx(
				styles.notification,
				className,
				isOpen && styles.open,
				isClosing && styles.closing
			)}
			role='status'
			aria-live='polite'
			aria-atomic='true'
		>
			<p>{text}</p>
		</div>
	);
};
