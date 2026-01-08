import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import { useNavBarStore } from '@/features/ui/model/useNavBarStore';
import {
	MOBILE_BREAKPOINT,
	SMALL_MOBILE_BREAKPOINT,
	SSR_FALLBACK_WIDTH,
} from '@/shared/constants/breakpoints';
import { Button, Icon, Title } from '@ui/index';

import { MobilePanel } from './MobilePanel';

import styles from './NavBar.module.scss';

export const NavBarWidget: React.FC = () => {
	const t = useTranslations('layout.navbar.NavBar');

	const isPanelOpen = useNavBarStore((s) => s.isPanelOpen);
	const togglePanel = useNavBarStore((s) => s.toggle);
	const closePanel = useNavBarStore((s) => s.close);

	const [isClient, setIsClient] = useState(false);
	const [windowWidth, setWindowWidth] = useState<number>(SSR_FALLBACK_WIDTH);
	const triggerRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		setIsClient(true);
		const update = () => setWindowWidth(window.innerWidth);
		update();
		window.addEventListener('resize', update);

		return () => window.removeEventListener('resize', update);
	}, []);

	useEffect(() => {
		if (!isClient) return;
		if (windowWidth > MOBILE_BREAKPOINT && isPanelOpen) {
			closePanel();
		}
	}, [isClient, windowWidth, isPanelOpen, closePanel]);

	return (
		<>
			<nav
				className={styles.navbar}
				aria-label={t('aria.mainNavigation')}
			>
				<div className={styles.left}>
					<div className={styles.logo}>
						<Icon
							icon='Language'
							className={styles.icon}
						/>
						<Title className={styles.title}>{t('brand.name')}</Title>
					</div>

					{(!isClient || windowWidth > SMALL_MOBILE_BREAKPOINT) && (
						<ul className={styles.navList}>
							<li>
								<Button text={t('links.home')} />
							</li>
							<li>
								<Button text={t('links.docs')} />
							</li>
						</ul>
					)}
				</div>

				<div className={styles.right}>
					{(!isClient || windowWidth > MOBILE_BREAKPOINT) && (
						<>
							<Button
								aria-label={t('buttons.language')}
								icon={<Icon icon='Language' />}
							/>
							<Button
								href='https://github.com/TaDmitry'
								aria-label={t('buttons.github')}
								icon={<Icon icon='LogoGithub' />}
							/>
						</>
					)}

					{isClient && windowWidth <= MOBILE_BREAKPOINT && (
						<Button
							icon={<Icon icon='ChevronBackOutline' />}
							className={clsx(styles.dropdown, isPanelOpen && styles.dropdownOpen)}
							onClick={togglePanel}
							ref={triggerRef}
							aria-expanded={isPanelOpen}
							aria-controls='mobile-panel'
							aria-label={isPanelOpen ? t('buttons.closeMenu') : t('buttons.openMenu')}
						/>
					)}
				</div>
			</nav>

			{isClient && (
				<MobilePanel
					triggerRef={triggerRef}
					id='mobile-panel'
				/>
			)}
		</>
	);
};
