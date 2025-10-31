import { useEffect, useState } from 'react';
import clsx from 'clsx';

import styles from './Notification.module.scss';

const AUTO_CLOSE_DELAY_MS = 1000;
const CLOSE_ANIMATION_DURATION_MS = 300;

interface NotificationProps {
	text: string;
	onClose: () => void;
	duration?: number;
}

export const Notification = ({
	text,
	onClose,
	duration = AUTO_CLOSE_DELAY_MS,
}: NotificationProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		setIsOpen(true);

		const closeAnimTimer = setTimeout(() => {
			setIsClosing(true);
		}, duration);

		const closeTimer = setTimeout(() => {
			onClose();
		}, duration + CLOSE_ANIMATION_DURATION_MS);

		return () => {
			clearTimeout(closeAnimTimer);
			clearTimeout(closeTimer);
		};
	}, [duration, onClose]);

	return (
		<div className={clsx(styles.notification, isOpen && styles.open, isClosing && styles.closing)}>
			<p>{text}</p>
		</div>
	);
};
