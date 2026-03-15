'use client';

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

import { usePathname, useRouter } from '@/shared/config/i18n/navigation';
import { Button } from '@/shared/ui/index';

import { useLanguagePanelStore } from '../../model';

import styles from './LanguagePanel.module.scss';

const TRANSITION_MS = 350;

type Variant = 'desktop' | 'mobile';

interface LanguagePanelProps {
	variant: Variant;
	id?: string;
	triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const LANGUAGES = [
	{ code: 'en', label: 'English' },
	{ code: 'ru', label: 'Русский' },
] as const;

const schedule = (cb: () => void) => {
	if (typeof queueMicrotask === 'function') {
		queueMicrotask(cb);

		return;
	}

	setTimeout(cb, 0);
};

type PanelState = 'unmounted' | 'mounting' | 'visible' | 'closing';

type PanelAction =
	| { type: 'ACTIVATE' }
	| { type: 'SHOW' }
	| { type: 'DEACTIVATE' }
	| { type: 'HIDE' }
	| { type: 'UNMOUNT' };

const panelReducer = (state: PanelState, action: PanelAction): PanelState => {
	switch (action.type) {
		case 'ACTIVATE':
			return state === 'unmounted' ? 'mounting' : state;
		case 'SHOW':
			return state === 'mounting' ? 'visible' : state;
		case 'DEACTIVATE':
			return state === 'visible' ? 'closing' : state;
		case 'HIDE':
			return 'closing';
		case 'UNMOUNT':
			return 'unmounted';
		default:
			return state;
	}
};

export const LanguagePanel: React.FC<LanguagePanelProps> = ({
	variant,
	id = 'language-panel',
	triggerRef,
}) => {
	const t = useTranslations('layout.navbar.LanguagePanel');
	const router = useRouter();
	const pathname = usePathname();

	const panelRef = useRef<HTMLDivElement | null>(null);
	const closeTimerRef = useRef<number | null>(null);
	const rafRef = useRef<number | null>(null);
	const previouslyFocusedRef = useRef<HTMLElement | null>(null);

	const isOpen = useLanguagePanelStore((s) => s.isOpen);
	const context = useLanguagePanelStore((s) => s.context);
	const closePanel = useLanguagePanelStore((s) => s.close);

	const isActive = useMemo(() => isOpen && context === variant, [isOpen, context, variant]);

	const [panelState, dispatch] = useReducer(panelReducer, 'unmounted');

	const restoreFocus = useCallback(() => {
		const panelEl = panelRef.current;
		const activeElement = document.activeElement as HTMLElement | null;

		if (!panelEl || !activeElement || !panelEl.contains(activeElement)) {
			return;
		}

		const triggerEl = triggerRef?.current ?? null;

		if (triggerEl && !triggerEl.hasAttribute('disabled')) {
			triggerEl.focus();

			return;
		}

		previouslyFocusedRef.current?.focus?.();
	}, [triggerRef]);

	useEffect(() => {
		const clearPendingAnimations = () => {
			if (closeTimerRef.current) {
				clearTimeout(closeTimerRef.current);
				closeTimerRef.current = null;
			}
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};

		//* очистки
		clearPendingAnimations();

		if (isActive) {
			//* Монтируем асинхронно, чтобы не словить setState-in-effect
			schedule(() => dispatch({ type: 'ACTIVATE' }));

			//* Даем React отрендерить элемент, затем включаем анимацию
			rafRef.current = requestAnimationFrame(() => {
				schedule(() => dispatch({ type: 'SHOW' }));
			});

			return clearPendingAnimations;
		}

		//* Закрытие: убираем видимость (асинхронно)
		schedule(() => dispatch({ type: 'HIDE' }));

		//* После transition размонтируем
		closeTimerRef.current = window.setTimeout(() => {
			dispatch({ type: 'UNMOUNT' });
			closeTimerRef.current = null;
		}, TRANSITION_MS);

		return clearPendingAnimations;
	}, [isActive]);

	useEffect(() => {
		const isMounted = panelState !== 'unmounted';
		if (!isMounted || !panelRef.current) {
			return () => {};
		}

		const panelEl = panelRef.current;

		//* Родитель-контейнер: кнопка + панель (чтобы клики по кнопке не считались "outside")
		const containerEl = panelEl.parentElement;

		previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

		const focusableSelector =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

		const getFocusable = () =>
			Array.from(panelEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(
				(el) => !el.hasAttribute('disabled')
			);

		//* Фокус после монтирования
		const focusRaf = requestAnimationFrame(() => {
			getFocusable()[0]?.focus();
		});

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				restoreFocus();
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

			restoreFocus();
			closePanel();
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			cancelAnimationFrame(focusRaf);
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);

			restoreFocus();
		};
	}, [panelState, closePanel, restoreFocus]);

	useEffect(() => {
		const panelEl = panelRef.current;

		if (!panelEl) {
			return () => {};
		}

		panelEl.inert = !isActive;

		if (!isActive) {
			restoreFocus();
		}

		return () => {
			panelEl.inert = false;
		};
	}, [isActive, restoreFocus]);

	const handleLanguageChange = useCallback(
		(languageCode: (typeof LANGUAGES)[number]['code']) => {
			const targetPath = `${pathname}${window.location.search}${window.location.hash}`;
			restoreFocus();
			router.push(targetPath, { locale: languageCode });
			closePanel();
		},
		[pathname, router, closePanel, restoreFocus]
	);

	const isMounted = panelState !== 'unmounted';
	const isVisible = panelState === 'visible';

	if (!isMounted) return null;

	return (
		<div
			id={id}
			ref={panelRef}
			className={clsx(
				styles.panel,
				variant === 'desktop' ? styles.panelDesktop : styles.panelMobile,
				isVisible && styles.panelOpen
			)}
			style={{ '--language-panel-transition-ms': `${TRANSITION_MS}ms` } as React.CSSProperties}
			role='menu'
			aria-label={t('aria.panel')}
		>
			{LANGUAGES.map((lang) => (
				<Button
					key={lang.code}
					text={lang.label}
					onClick={() => handleLanguageChange(lang.code)}
					className={styles.languageButton}
					role='menuitem'
					aria-label={lang.label}
				/>
			))}
		</div>
	);
};
