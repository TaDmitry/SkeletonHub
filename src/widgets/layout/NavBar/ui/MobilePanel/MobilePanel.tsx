import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import { usePathname } from '@/shared/config/i18n/navigation';
import { SMALL_MOBILE_BREAKPOINT } from '@/shared/constants/breakpoints';
import { Button, Icon } from '@/shared/ui/index';

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
	const pathname = usePathname();

	const panelRef = useRef<HTMLElement | null>(null);
	const languageTriggerRef = useRef<HTMLButtonElement | null>(null);

	const isOpen = useNavBarStore((s) => s.isPanelOpen);
	const closePanel = useNavBarStore((s) => s.close);

	const toggleLanguagePanel = useLanguagePanelStore((s) => s.toggle);
	const isLanguagePanelOpen = useLanguagePanelStore((s) => s.isOpen);
	const languagePanelContext = useLanguagePanelStore((s) => s.context);

	const isMobileLanguagePanelOpen = isLanguagePanelOpen && languagePanelContext === 'mobile';
	const isDocsPage = pathname === '/docs' || pathname.startsWith('/docs/');
	const isBlogPage = pathname === '/blog' || pathname.startsWith('/blog/');

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

		getFocusable()[0]?.focus();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				closePanel();

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

			closePanel();
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);

			if (triggerEl) {
				triggerEl.focus();
			} else {
				previouslyFocused?.focus?.();
			}
		};
	}, [isOpen, closePanel, triggerRef]);

	if (!isOpen) return null;

	const isSmallMobile = windowWidth <= SMALL_MOBILE_BREAKPOINT;

	return (
		<section
			id={id}
			ref={panelRef}
			className={styles.panel}
			role='dialog'
			aria-modal='true'
			aria-label={t('aria.panel')}
			data-open={isOpen ? 'true' : 'false'}
		>
			{isSmallMobile && (
				<div className={clsx(styles.group, styles.groupTop)}>
					<Button
						icon={<Icon icon='Library' />}
						className={clsx(styles.iconButton, isDocsPage && styles.iconButtonActive)}
						aria-label={t('buttons.docs')}
						href='/docs'
						aria-current={isDocsPage ? 'page' : undefined}
					/>
					<Button
						icon={<Icon icon='Book' />}
						className={clsx(styles.iconButton, isBlogPage && styles.iconButtonActive)}
						aria-label={t('buttons.blog')}
						href='/blog'
						aria-current={isBlogPage ? 'page' : undefined}
					/>
				</div>
			)}

			{isSmallMobile && (
				<Icon
					icon='CodeSlash'
					className={styles.brandIcon}
				/>
			)}

			<div className={clsx(styles.group, styles.groupBottom)}>
				<div className={styles.languageControl}>
					<Button
						icon={<Icon icon='Language' />}
						className={styles.iconButton}
						onClick={() => toggleLanguagePanel('mobile')}
						ref={languageTriggerRef}
						aria-label={t('buttons.language')}
						aria-expanded={isMobileLanguagePanelOpen}
						aria-controls='mobile-language-panel'
					/>
					<LanguagePanel
						variant='mobile'
						id='mobile-language-panel'
						triggerRef={languageTriggerRef}
					/>
				</div>

				<Button
					href='https://github.com/TaDmitry'
					icon={<Icon icon='LogoGithub' />}
					className={styles.iconButton}
					aria-label={t('buttons.github')}
				/>
			</div>
		</section>
	);
};
