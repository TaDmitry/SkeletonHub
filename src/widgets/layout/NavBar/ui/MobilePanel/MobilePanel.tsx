import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import { SMALL_MOBILE_BREAKPOINT } from '@/shared/constants/breakpoints';
import { Button, Icon } from '@ui/index';

import { useLanguagePanelStore, useNavBarStore } from '../../model';
import { LanguagePanel } from '../LanguagePanel/LanguagePanel';

import styles from './MobilePanel.module.scss';

interface MobilePanelProps {
	triggerRef?: React.RefObject<HTMLButtonElement | null>;
	windowWidth: number;
	id?: string;
}

export const MobilePanel: React.FC<MobilePanelProps> = ({
	triggerRef,
	windowWidth,
	id = 'mobile-panel',
}) => {
	const t = useTranslations('layout.navbar.MobilePanel');

	const panelRef = useRef<HTMLElement | null>(null);

	const isOpen = useNavBarStore((s) => s.isPanelOpen);
	const close = useNavBarStore((s) => s.close);

	const toggleLanguagePanel = useLanguagePanelStore((s) => s.toggle);

	useEffect(() => {
		if (!isOpen || !panelRef.current) {
			return () => {};
		}

		const panelEl = panelRef.current;
		const triggerEl = triggerRef?.current ?? null;
		const previouslyFocused = document.activeElement as HTMLElement | null;

		const focusableSelector =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

		const getFocusable = () =>
			Array.from(panelEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(
				(el) => !el.hasAttribute('disabled')
			);

		//* Фокус на первый элемент
		getFocusable()[0]?.focus();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				close();

				return;
			}

			if (e.key !== 'Tab') return;

			const focusable = getFocusable();
			if (focusable.length === 0) return;

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
	}, [isOpen, close, triggerRef]);

	if (!isOpen) return null;

	const isSmallMobile = windowWidth <= SMALL_MOBILE_BREAKPOINT;

	return (
		<aside
			id={id}
			ref={panelRef}
			className={styles.sidePanel}
			role='dialog'
			aria-modal='true'
			aria-label={t('aria.panel')}
		>
			<nav
				aria-label={t('aria.navigation')}
				className={styles.panelNav}
			>
				{isSmallMobile && (
					<div className={clsx(styles.panelTop, styles.panelBottom)}>
						<Button
							icon={<Icon icon='Library' />}
							className={styles.panelButton}
							aria-label={t('buttons.docs')}
						/>
						<Button
							icon={<Icon icon='Book' />}
							className={styles.panelButton}
							aria-label={t('buttons.blog')}
						/>
					</div>
				)}

				<div className={clsx(styles.panelTop, styles.panelMiddle)}>
					<div className={styles.mobileLanguageControl}>
						<Button
							icon={<Icon icon='Language' />}
							className={clsx(styles.panelButton, styles.languageButton)}
							onClick={() => toggleLanguagePanel('mobile')}
							aria-label={t('buttons.language')}
						/>

						<LanguagePanel variant='mobile' />
					</div>

					<Button
						href='https://github.com/TaDmitry'
						icon={<Icon icon='LogoGithub' />}
						className={clsx(styles.panelButton, styles.githubButton)}
						aria-label={t('buttons.github')}
					/>
				</div>
			</nav>
		</aside>
	);
};
