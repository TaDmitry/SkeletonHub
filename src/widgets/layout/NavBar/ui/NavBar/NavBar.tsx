'use client';

import React, { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import { usePathname } from '@/shared/config/i18n/navigation';
import { MOBILE_BREAKPOINT } from '@/shared/constants/breakpoints';
import { Button, Icon } from '@/shared/ui/index';

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

	const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
	const desktopLanguageTriggerRef = useRef<HTMLButtonElement | null>(null);

	// Закрываем мобильную панель при переходе на десктоп
	useEffect(() => {
		const mq = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT + 1}px)`);

		const handleChange = (e: MediaQueryListEvent) => {
			if (e.matches) {
				closePanel();
				closeLanguagePanel();
			}
		};

		mq.addEventListener('change', handleChange);

		return () => mq.removeEventListener('change', handleChange);
	}, [closePanel, closeLanguagePanel]);

	const isDesktopLanguagePanelOpen = isLanguagePanelOpen && languagePanelContext === 'desktop';
	const isDocsPage = pathname === '/docs' || pathname.startsWith('/docs/');
	const isBlogPage = pathname === '/blog' || pathname.startsWith('/blog/');

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
								<Icon
									icon='CodeSlash'
									className={styles.brandIcon}
								/>
							}
							className={styles.brandLink}
							title={t('links.home')}
						/>
					</div>

					<ul className={styles.navList}>
						<li className={styles.navItem}>
							<Button
								text={t('links.docs')}
								href='/docs'
								className={clsx(isDocsPage && styles.navLinkActive)}
								aria-current={isDocsPage ? 'page' : undefined}
							/>
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
				</div>

				<div className={styles.right}>
					{/* Десктопные кнопки — скрыты на мобиле через CSS */}
					<div className={styles.desktopActions}>
						<Button
							aria-label={t('buttons.language')}
							icon={<Icon icon='Language' />}
							onClick={() => toggleLanguagePanel('desktop')}
							className={styles.iconButton}
							ref={desktopLanguageTriggerRef}
							aria-expanded={isDesktopLanguagePanelOpen}
							aria-controls='desktop-language-panel'
						/>
						<LanguagePanel
							variant='desktop'
							id='desktop-language-panel'
							triggerRef={desktopLanguageTriggerRef}
						/>
						<Button
							href='https://github.com/TaDmitry'
							aria-label={t('buttons.github')}
							icon={<Icon icon='LogoGithub' />}
							className={styles.iconButton}
						/>
					</div>

					<div className={styles.mobileAction}>
						<Button
							icon={<Icon icon='ChevronBackOutline' />}
							className={clsx(styles.menuButton, isPanelOpen && styles.menuButtonOpen)}
							onClick={togglePanel}
							ref={mobileMenuTriggerRef}
							aria-expanded={isPanelOpen}
							aria-controls='mobile-panel'
							aria-label={isPanelOpen ? t('buttons.closeMenu') : t('buttons.openMenu')}
						/>
					</div>
				</div>
			</section>

			<MobilePanel
				triggerRef={mobileMenuTriggerRef}
				id='mobile-panel'
				windowWidth={0}
			/>
		</nav>
	);
};
