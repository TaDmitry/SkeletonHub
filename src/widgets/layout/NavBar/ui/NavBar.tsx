import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import {
	MOBILE_BREAKPOINT,
	SMALL_MOBILE_BREAKPOINT,
	SSR_FALLBACK_WIDTH,
} from '@/shared/constants/breakpoints';
import { Button, Icon, Title } from '@ui/index';

import { MobilePanel } from './MobilePanel';

import styles from './NavBar.module.scss';

export const NavBarWidget: React.FC = () => {
	const [isPanelOpen, setIsPanelOpen] = useState(false);
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
			setIsPanelOpen(false);
		}
	}, [isClient, windowWidth, isPanelOpen]);

	const togglePanel = () => setIsPanelOpen((prev) => !prev);
	const closePanel = () => setIsPanelOpen(false);

	return (
		<>
			<nav
				className={styles.navbar}
				aria-label='Основная навигация'
			>
				<div className={styles.left}>
					<div className={styles.logo}>
						<Icon
							icon='Language'
							className={styles.icon}
						/>
						<Title className={styles.title}>SkeletonUI</Title>
					</div>

					{(!isClient || windowWidth > SMALL_MOBILE_BREAKPOINT) && (
						<ul className={styles.navList}>
							<li>
								<Button text='Главная' />
							</li>
							<li>
								<Button text='Документация' />
							</li>
						</ul>
					)}
				</div>

				<div className={styles.right}>
					{(!isClient || windowWidth > MOBILE_BREAKPOINT) && (
						<>
							<Button
								icon={<Icon icon='Language' />}
								className={styles.features}
							/>
							<Button
								icon={<Icon icon='LogoGithub' />}
								className={styles.features}
							/>
						</>
					)}

					{isClient && windowWidth <= MOBILE_BREAKPOINT && (
						<Button
							icon={<Icon icon='ChevronBackOutline' />}
							className={clsx(styles.features, styles.dropdown, isPanelOpen && styles.dropdownOpen)}
							onClick={togglePanel}
							ref={triggerRef}
							aria-expanded={isPanelOpen}
							aria-controls='mobile-panel'
							aria-label={isPanelOpen ? 'Закрыть меню' : 'Открыть меню'}
						/>
					)}
				</div>
			</nav>

			{isClient && (
				<MobilePanel
					isOpen={isPanelOpen}
					onClose={closePanel}
					triggerRef={triggerRef}
					id='mobile-panel'
				/>
			)}
		</>
	);
};
