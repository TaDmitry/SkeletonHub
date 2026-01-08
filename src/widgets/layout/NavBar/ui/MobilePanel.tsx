import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import {
	MOBILE_BREAKPOINT,
	SMALL_MOBILE_BREAKPOINT,
	SSR_FALLBACK_WIDTH,
} from '@/shared/constants/breakpoints';
import { useNavBarStore } from '@features/ui/model/useNavBarStore';
import { Button, Icon } from '@ui/index';

import styles from './NavBar.module.scss';

const TRANSITION_MS = 350;

interface MobilePanelProps {
	triggerRef?: React.RefObject<HTMLButtonElement | null>;
	id?: string;
}

export const MobilePanel: React.FC<MobilePanelProps> = ({ triggerRef, id = 'mobile-panel' }) => {
	const t = useTranslations('layout.navbar.MobilePanel');

	const panelRef = useRef<HTMLElement | null>(null);
	const isOpen = useNavBarStore((s) => s.isPanelOpen);
	const close = useNavBarStore((s) => s.close);

	const [windowWidth, setWindowWidth] = useState<number>(SSR_FALLBACK_WIDTH);

	const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
	const [isAnimatingOpen, setIsAnimatingOpen] = useState<boolean>(false);
	const timeoutRef = useRef<number | null>(null);

	useEffect(() => {
		const onResize = () => {
			const width = window.innerWidth;
			setWindowWidth(width);

			if (width > MOBILE_BREAKPOINT) {
				close();
			}
		};

		onResize();
		window.addEventListener('resize', onResize);

		return () => window.removeEventListener('resize', onResize);
	}, [close]);

	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		if (isOpen) {
			setShouldRender(true);
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setIsAnimatingOpen(true);
				});
			});
		} else {
			setIsAnimatingOpen(false);
			timeoutRef.current = window.setTimeout(() => {
				setShouldRender(false);
				timeoutRef.current = null;
			}, TRANSITION_MS);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [isOpen]);

	useEffect(() => {
		if (!shouldRender || !panelRef.current) {
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
				close();

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

			close();
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);

			triggerEl?.focus?.() ?? previouslyFocused?.focus?.();
		};
	}, [shouldRender, close, triggerRef]);

	if (!shouldRender) return null;

	const isSmallMobile = windowWidth <= SMALL_MOBILE_BREAKPOINT;

	return (
		<aside
			id={id}
			ref={panelRef}
			className={clsx(styles.sidePanel, isAnimatingOpen && styles.sidePanelOpen)}
			role='dialog'
			aria-modal='true'
			aria-hidden={!isOpen}
			aria-label={t('aria.panel')}
		>
			<nav
				aria-label={t('aria.navigation')}
				className={styles.panelNav}
			>
				{isSmallMobile && (
					<div className={clsx(styles.panelTop, styles.panelBottom)}>
						<Button
							icon={<Icon icon='Home' />}
							className={styles.panelButton}
							aria-label={t('buttons.home')}
						/>
						<Button
							icon={<Icon icon='Book' />}
							className={styles.panelButton}
							aria-label={t('buttons.docs')}
						/>
					</div>
				)}

				<div className={clsx(styles.panelTop, styles.panelMiddle)}>
					<Button
						icon={<Icon icon='Language' />}
						className={styles.panelButton}
						aria-label={t('buttons.language')}
					/>
					<Button
						icon={<Icon icon='LogoGithub' />}
						className={clsx(styles.panelButton, styles.githubButton)}
						aria-label={t('buttons.github')}
					/>
				</div>
			</nav>
		</aside>
	);
};
