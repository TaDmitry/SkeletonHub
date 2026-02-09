import { useCallback, useEffect, useRef } from 'react';

export type CloseFn = () => void;

export interface UseModalAccessibilityProps {
	isOpen: boolean;
	alignElement?: 'start' | 'center';
	onRequestClose?: (fn: CloseFn) => void;
	closeWithAnimation: CloseFn;
}

export function useModalAccessibility({
	isOpen,
	alignElement = 'center',
	onRequestClose,
	closeWithAnimation,
}: UseModalAccessibilityProps) {
	const contentRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (onRequestClose) onRequestClose(closeWithAnimation);
	}, [onRequestClose, closeWithAnimation]);

	useEffect(() => {
		if (isOpen && contentRef.current) {
			contentRef.current.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		const onDocumentKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && alignElement !== 'start') {
				closeWithAnimation();
			}
		};

		document.addEventListener('keydown', onDocumentKeyDown);

		return () => document.removeEventListener('keydown', onDocumentKeyDown);
	}, [alignElement, closeWithAnimation]);

	const handleOverlayClick = useCallback(() => {
		if (alignElement !== 'start') closeWithAnimation();
	}, [alignElement, closeWithAnimation]);

	const handleOverlayKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
				e.preventDefault();
				handleOverlayClick();
			}
		},
		[handleOverlayClick]
	);

	const handleOverlayKeyUp = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
				handleOverlayClick();
			}
		},
		[handleOverlayClick]
	);

	const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

	return {
		contentRef,
		handlers: {
			overlay: {
				role: 'button' as const,
				tabIndex: 0,
				onClick: handleOverlayClick,
				onKeyDown: handleOverlayKeyDown,
				onKeyUp: handleOverlayKeyUp,
			},
			content: {
				'role': 'dialog' as const,
				'aria-modal': 'true' as const,
				'tabIndex': -1,
				'onClick': stopPropagation,
			},
		},
	};
}
