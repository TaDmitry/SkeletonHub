'use client';

import React, { ReactNode, useCallback, useEffect, useReducer } from 'react';
import clsx from 'clsx';

import { useModalAccessibility } from './hooks/useModalAccessibility';

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

type ModalState = {
	isOpen: boolean;
	isClosing: boolean;
	bgVisible: boolean;
};

type ModalAction =
	| { type: 'OPEN'; withBackground: boolean }
	| { type: 'CLOSE'; withBackground: boolean };

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
	switch (action.type) {
		case 'OPEN':
			return {
				isOpen: true,
				isClosing: false,
				bgVisible: action.withBackground,
			};
		case 'CLOSE':
			return {
				isOpen: false,
				isClosing: true,
				bgVisible: false,
			};
		default:
			return state;
	}
};

export const Modal: React.FC<ModalProps> = ({
	children,
	text,
	setIsModalOpened,
	classNameContent,
	withBackground = false,
	onRequestClose,
}) => {
	const [state, dispatch] = useReducer(modalReducer, {
		isOpen: false,
		isClosing: false,
		bgVisible: false,
	});

	const closeWithAnimation = useCallback(() => {
		dispatch({ type: 'CLOSE', withBackground });
		setTimeout(() => setIsModalOpened(false), CLOSE_ANIMATION_DURATION_MS);
	}, [setIsModalOpened, withBackground]);

	const { contentRef, handlers } = useModalAccessibility({
		isOpen: state.isOpen,
		onRequestClose,
		closeWithAnimation,
	});

	useEffect(() => {
		const openTimer = setTimeout(() => {
			dispatch({ type: 'OPEN', withBackground });
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
				withBackground && state.bgVisible && styles.bgVisible
			)}
			{...handlers.overlay}
		>
			<div
				ref={contentRef}
				className={clsx(
					styles.contentWrapper,
					state.isOpen && styles.open,
					state.isClosing && styles.closing,
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
