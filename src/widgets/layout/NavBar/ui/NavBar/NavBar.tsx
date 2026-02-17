'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import { usePathname } from '@/shared/config/i18n/navigation';
import {
	MOBILE_BREAKPOINT,
	SMALL_MOBILE_BREAKPOINT,
	SSR_FALLBACK_WIDTH,
} from '@/shared/constants/breakpoints';
import { Button, Icon } from '@ui/index';

import { useLanguagePanelStore, useNavBarStore } from '../../model';
import { LanguagePanel } from '../LanguagePanel/LanguagePanel';
import { MobilePanel } from '../MobilePanel/MobilePanel';

import styles from './NavBar.module.scss';

export const NavBarWidget: React.FC = () => {
	const t = useTranslations('layout.navbar.NavBar');
	const pathname = usePathname();

	const isPanelOpen = useNavBarStore((s) => s.isPanelOpen);
	const togglePanel = useNavBarStore((s) => s.toggle);
	const closePanel = useNavBarStore((s) => s.close);

	const toggleLanguagePanel = useLanguagePanelStore((s) => s.toggle);
	const closeLanguagePanel = useLanguagePanelStore((s) => s.close);
	const isLanguagePanelOpen = useLanguagePanelStore((s) => s.isOpen);
	const languagePanelContext = useLanguagePanelStore((s) => s.context);

	const [windowWidth, setWindowWidth] = useState<number>(SSR_FALLBACK_WIDTH);

	const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		const updateWindowWidth = () => setWindowWidth(window.innerWidth);

		updateWindowWidth();
		window.addEventListener('resize', updateWindowWidth);

		return () => window.removeEventListener('resize', updateWindowWidth);
	}, []);

	const hasMeasuredWidth = windowWidth !== SSR_FALLBACK_WIDTH;

	const { isDesktop, showNavLinks } = useMemo(() => {
		return {
			isDesktop: windowWidth > MOBILE_BREAKPOINT,
			showNavLinks: windowWidth > SMALL_MOBILE_BREAKPOINT,
		};
	}, [windowWidth]);

	const isDesktopLanguagePanelOpen = isLanguagePanelOpen && languagePanelContext === 'desktop';
	const isBlogPage = pathname === '/blog' || pathname.startsWith('/blog/');

	useEffect(() => {
		if (!hasMeasuredWidth) return;

		//* На десктопе мобильная панель не нужна.
		if (isDesktop && isPanelOpen) {
			closePanel();
		}

		//* При смене ширины/режима прячем языковую панель.
		closeLanguagePanel();
	}, [hasMeasuredWidth, isDesktop, isPanelOpen, closePanel, closeLanguagePanel]);

	return (
		<nav
			className={styles.navbar}
			aria-label={t('aria.mainNavigation')}
		>
			<section className={styles.container}>
				<div className={styles.left}>
					<div className={styles.brand}>
						<Button
							text={t('brand.name')}
							href='/'
							icon={
								showNavLinks ? (
									<Icon
										icon='CodeSlash'
										className={styles.brandIcon}
									/>
								) : undefined
							}
							className={styles.brandLink}
							title={t('links.home')}
						/>
					</div>

					{showNavLinks && (
						<ul className={styles.navList}>
							<li className={styles.navItem}>
								<Button text={t('links.docs')} />
							</li>
							<li className={styles.navItem}>
								<Button
									text={t('links.blog')}
									href='/blog'
									className={clsx(isBlogPage && styles.navLinkActive)}
									aria-current={isBlogPage ? 'page' : undefined}
								/>
							</li>
						</ul>
					)}
				</div>

				<div className={styles.right}>
					{isDesktop ? (
						<>
							<Button
								aria-label={t('buttons.language')}
								icon={<Icon icon='Language' />}
								onClick={() => toggleLanguagePanel('desktop')}
								className={styles.iconButton}
								aria-expanded={isDesktopLanguagePanelOpen}
								aria-controls='desktop-language-panel'
							/>
							<LanguagePanel
								variant='desktop'
								id='desktop-language-panel'
							/>
							<Button
								href='https://github.com/TaDmitry'
								aria-label={t('buttons.github')}
								icon={<Icon icon='LogoGithub' />}
								className={styles.iconButton}
							/>
						</>
					) : (
						hasMeasuredWidth && (
							<Button
								icon={<Icon icon='ChevronBackOutline' />}
								className={clsx(styles.menuButton, isPanelOpen && styles.menuButtonOpen)}
								onClick={togglePanel}
								ref={mobileMenuTriggerRef}
								aria-expanded={isPanelOpen}
								aria-controls='mobile-panel'
								aria-label={isPanelOpen ? t('buttons.closeMenu') : t('buttons.openMenu')}
							/>
						)
					)}
				</div>
			</section>

			{hasMeasuredWidth && (
				<MobilePanel
					triggerRef={mobileMenuTriggerRef}
					windowWidth={windowWidth}
					id='mobile-panel'
				/>
			)}
		</nav>
	);
};
