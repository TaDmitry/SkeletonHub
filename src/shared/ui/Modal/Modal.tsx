import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';

import { useModalAccessibility } from './useModalAccessibility';

import styles from './Modal.module.scss';

const CLOSE_ANIMATION_DURATION_MS = 300;

export interface ModalProps {
	children?: ReactNode;
	setIsModalOpened: (state: boolean) => void;
	classNameContent?: string;
	withBackground?: boolean;
	text?: string;
	onRequestClose?: (fn: () => void) => void;
}

export const Modal: React.FC<ModalProps> = ({
	children,
	text,
	setIsModalOpened,
	classNameContent,
	withBackground = false,
	onRequestClose,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [bgVisible, setBgVisible] = useState(false);

	const closeWithAnimation = useCallback(() => {
		setIsClosing(true);
		setIsOpen(false);
		if (withBackground) setBgVisible(false);
		setTimeout(() => setIsModalOpened(false), CLOSE_ANIMATION_DURATION_MS);
	}, [setIsModalOpened, withBackground]);

	const { contentRef, handlers } = useModalAccessibility({
		isOpen,
		onRequestClose,
		closeWithAnimation,
	});

	useEffect(() => {
		const openTimer = setTimeout(() => {
			setIsOpen(true);
			if (withBackground) setBgVisible(true);
		}, 0);

		return () => {
			clearTimeout(openTimer);
		};
	}, [withBackground]);

	return (
		<div
			className={clsx(
				styles.wrapper,
				withBackground && styles.withBackground,
				withBackground && bgVisible && styles.bgVisible
			)}
			{...handlers.overlay}
		>
			<div
				ref={contentRef}
				className={clsx(
					styles.contentWrapper,
					isOpen && styles.open,
					isClosing && styles.closing,
					classNameContent
				)}
				{...handlers.content}
			>
				{text && <p>{text}</p>}
				{children}
			</div>
		</div>
	);
};
