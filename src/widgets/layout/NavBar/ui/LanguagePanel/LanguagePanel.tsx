import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import { usePathname, useRouter } from '@/shared/config/i18n/navigation';
import { Button } from '@ui/index';

import { useLanguagePanelStore } from '../../model';

import styles from './LanguagePanel.module.scss';

const TRANSITION_MS = 350;

type Variant = 'desktop' | 'mobile';

interface LanguagePanelProps {
	variant: Variant;
	id?: string;
}

const LANGUAGES = [
	{ code: 'en', label: 'English' },
	{ code: 'ru', label: 'Русский' },
] as const;

export const LanguagePanel: React.FC<LanguagePanelProps> = ({ variant, id = 'language-panel' }) => {
	const t = useTranslations('layout.navbar.LanguagePanel');
	const router = useRouter();
	const pathname = usePathname();

	const panelRef = useRef<HTMLDivElement | null>(null);
	const timeoutRef = useRef<number | null>(null);

	const isOpen = useLanguagePanelStore((s) => s.isOpen);
	const context = useLanguagePanelStore((s) => s.context);
	const closePanel = useLanguagePanelStore((s) => s.close);

	const isActive = useMemo(() => isOpen && context === variant, [isOpen, context, variant]);

	const [shouldRender, setShouldRender] = useState<boolean>(isActive);
	const [isVisible, setIsVisible] = useState<boolean>(false);

	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		if (isActive) {
			setShouldRender(true);

			//* Даем React смонтировать элемент, затем включаем анимацию
			requestAnimationFrame(() => setIsVisible(true));

			return () => {};
		}

		//* Закрытие: выключаем видимость и ждём окончания transition
		setIsVisible(false);

		timeoutRef.current = window.setTimeout(() => {
			setShouldRender(false);
			timeoutRef.current = null;
		}, TRANSITION_MS);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [isActive]);

	useEffect(() => {
		if (!shouldRender || !panelRef.current) {
			return () => {};
		}

		const panelEl = panelRef.current;

		//* Родитель-контейнер: кнопка + панель (нужно, чтобы клики по кнопке не считались "outside")
		const containerEl = panelEl.parentElement;

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
			if (containerEl?.contains(target)) return;

			closePanel();
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);

			previouslyFocused?.focus?.();
		};
	}, [shouldRender, closePanel]);

	const handleLanguageChange = (languageCode: (typeof LANGUAGES)[number]['code']) => {
		router.push({ pathname }, { locale: languageCode });
		closePanel();
	};

	if (!shouldRender) return null;

	return (
		<div
			id={id}
			ref={panelRef}
			className={clsx(
				styles.panel,
				variant === 'desktop' ? styles.panelDesktop : styles.panelMobile,
				isVisible && styles.panelOpen
			)}
			role='menu'
			aria-hidden={!isActive}
			aria-label={t('aria.panel')}
		>
			{LANGUAGES.map((lang) => (
				<Button
					key={lang.code}
					text={lang.label}
					onClick={() => handleLanguageChange(lang.code)}
					className={styles.languageButton}
					aria-label={lang.label}
				/>
			))}
		</div>
	);
};
