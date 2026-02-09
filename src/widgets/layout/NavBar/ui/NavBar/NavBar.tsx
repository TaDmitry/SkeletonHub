import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

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

	//* mobile menu
	const isPanelOpen = useNavBarStore((s) => s.isPanelOpen);
	const togglePanel = useNavBarStore((s) => s.toggle);
	const closePanel = useNavBarStore((s) => s.close);

	//* language panel
	const toggleLanguagePanel = useLanguagePanelStore((s) => s.toggle);
	const closeLanguagePanel = useLanguagePanelStore((s) => s.close);

	const [isClient, setIsClient] = useState(false);
	const [windowWidth, setWindowWidth] = useState<number>(SSR_FALLBACK_WIDTH);

	const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		setIsClient(true);

		const update = () => setWindowWidth(window.innerWidth);

		update();
		window.addEventListener('resize', update);

		return () => window.removeEventListener('resize', update);
	}, []);

	useEffect(() => {
		if (!isClient) return;

		const isDesktop = windowWidth > MOBILE_BREAKPOINT;

		if (isDesktop && isPanelOpen) {
			closePanel();
		}

		closeLanguagePanel();
	}, [isClient, windowWidth, isPanelOpen, closePanel, closeLanguagePanel]);

	const isDesktop = !isClient || windowWidth > MOBILE_BREAKPOINT;
	const showNavLinks = !isClient || windowWidth > SMALL_MOBILE_BREAKPOINT;

	return (
		<>
			<nav
				className={styles.navbar}
				aria-label={t('aria.mainNavigation')}
			>
				<div className={styles.left}>
					<div className={styles.logo}>
						<Button
							text={t('brand.name')}
							href='/'
							icon={
								<Icon
									icon='Language'
									className={styles.icon}
								/>
							}
							className={styles.title}
							title={t('links.home')}
						/>
					</div>

					{showNavLinks && (
						<ul className={styles.navList}>
							<li>
								<Button text={t('links.docs')} />
							</li>
							<li>
								<Button text={t('links.blog')} />
							</li>
						</ul>
					)}
				</div>

				<div className={styles.right}>
					{isDesktop && (
						<>
							<Button
								aria-label={t('buttons.language')}
								icon={<Icon icon='Language' />}
								onClick={() => toggleLanguagePanel('desktop')}
								className={styles.languageButton}
							/>
							<LanguagePanel variant='desktop' />
							<Button
								href='https://github.com/TaDmitry'
								aria-label={t('buttons.github')}
								icon={<Icon icon='LogoGithub' />}
								className={styles.githubButton}
							/>
						</>
					)}

					{isClient && !isDesktop && (
						<Button
							icon={<Icon icon='ChevronBackOutline' />}
							className={clsx(styles.dropdown, isPanelOpen && styles.dropdownOpen)}
							onClick={togglePanel}
							ref={mobileMenuTriggerRef}
							aria-expanded={isPanelOpen}
							aria-controls='mobile-panel'
							aria-label={isPanelOpen ? t('buttons.closeMenu') : t('buttons.openMenu')}
						/>
					)}
				</div>
			</nav>

			{isClient && (
				<MobilePanel
					triggerRef={mobileMenuTriggerRef}
					windowWidth={windowWidth}
					id='mobile-panel'
				/>
			)}
		</>
	);
};
