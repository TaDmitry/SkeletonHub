import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { Button, Icon } from '@ui/index';

import styles from './NavBar.module.scss';

const MOBILE_BREAKPOINT = 768;

interface MobilePanelProps {
	isOpen: boolean;
	onClose: () => void;
	triggerRef?: React.RefObject<HTMLButtonElement | null>;
	id?: string;
}

export const MobilePanel: React.FC<MobilePanelProps> = ({
	isOpen,
	onClose,
	triggerRef,
	id = 'mobile-panel',
}) => {
	const panelRef = useRef<HTMLElement | null>(null);
	const [windowWidth, setWindowWidth] = useState<number | null>(null);

	useEffect(() => {
		const updateWidth = () => setWindowWidth(window.innerWidth);

		updateWidth();
		window.addEventListener('resize', updateWidth);

		return () => {
			window.removeEventListener('resize', updateWidth);
		};
	}, []);

	useEffect(() => {
		if (!isOpen || windowWidth === null) return;

		if (windowWidth > MOBILE_BREAKPOINT) {
			onClose();
		}
	}, [windowWidth, isOpen, onClose]);

	useEffect(() => {
		if (!isOpen || !panelRef.current) {
			return () => {};
		}

		const panelEl = panelRef.current;
		const triggerEl = triggerRef?.current ?? null;
		const previouslyFocused = document.activeElement as HTMLElement | null;

		const focusableSelector =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

		const focusable = Array.from(panelEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(
			(el) => !el.hasAttribute('disabled')
		);

		focusable[0]?.focus();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();

				return;
			}

			if (e.key !== 'Tab' || focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;

			if (panelEl.contains(target)) return;
			if (triggerEl?.contains(target)) return;

			onClose();
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);

			if (triggerEl?.focus) {
				triggerEl.focus();
			} else {
				previouslyFocused?.focus?.();
			}
		};
	}, [isOpen, onClose, triggerRef]);

	if (!isOpen) return null;

	return (
		<aside
			id={id}
			ref={panelRef}
			className={clsx(styles.sidePanel, isOpen && styles.sidePanelOpen)}
			role='dialog'
			aria-modal='true'
			aria-hidden={!isOpen}
			aria-label='Мобильное меню'
		>
			<nav
				aria-label='Mobile navigation'
				className={styles.panelNav}
			>
				<div className={styles.panelTop}>
					<Button
						icon={<Icon icon='LogoGithub' />}
						className={styles.panelButton}
					/>
					<Button
						icon={<Icon icon='Language' />}
						className={styles.panelButton}
					/>
				</div>

				<div className={styles.panelLinks}>
					<Button
						text='Главная'
						className={clsx(styles.panelButton, styles.smallOnly)}
					/>
					<Button
						text='Документация'
						className={clsx(styles.panelButton, styles.smallOnly)}
					/>
				</div>
			</nav>
		</aside>
	);
};
