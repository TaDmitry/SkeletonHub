import { useEffect, useRef } from 'react';

const RESIZE_DEBOUNCE_MS = 120;

type Params = {
	enabled: boolean;

	containerRef: React.RefObject<HTMLDivElement | null>;
	pageHiddenRef: React.RefObject<boolean>;
	resizeObserverRef: React.RefObject<ResizeObserver | null>;
	resizeTimeoutRef: React.RefObject<number | null>;

	applySize: (width: number, height: number) => void;
	startLoop: () => void;
	stopBgLoop: () => void;
	stopAll: () => void;
};

export function useSpiderLifecycle(params: Params) {
	const {
		enabled,
		containerRef,
		pageHiddenRef,
		resizeObserverRef,
		resizeTimeoutRef,
		applySize,
		startLoop,
		stopBgLoop,
		stopAll,
	} = params;

	const onVisibilityRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return () => {};

		// ResizeObserver + debounce
		resizeObserverRef.current = new ResizeObserver((entries) => {
			if (resizeTimeoutRef.current) window.clearTimeout(resizeTimeoutRef.current);

			resizeTimeoutRef.current = window.setTimeout(() => {
				for (const entry of entries) {
					const { width, height } = entry.contentRect;
					applySize(width, height);

					if (enabled && !pageHiddenRef.current) {
						stopBgLoop();
						startLoop();
					}
				}
				resizeTimeoutRef.current = null;
			}, RESIZE_DEBOUNCE_MS);
		});
		resizeObserverRef.current.observe(container);

		const onVisibility = () => {
			if (document.hidden) {
				pageHiddenRef.current = true;
				stopBgLoop();

				return;
			}

			pageHiddenRef.current = false;

			if (enabled) {
				stopBgLoop();
				startLoop();
			}
		};

		onVisibilityRef.current = onVisibility;
		document.addEventListener('visibilitychange', onVisibility);

		// старт фонового цикла
		if (enabled && !document.hidden) {
			stopBgLoop();
			startLoop();
		}

		return () => {
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect();
				resizeObserverRef.current = null;
			}
			if (resizeTimeoutRef.current) {
				window.clearTimeout(resizeTimeoutRef.current);
				resizeTimeoutRef.current = null;
			}

			if (onVisibilityRef.current) {
				document.removeEventListener('visibilitychange', onVisibilityRef.current);
				onVisibilityRef.current = null;
			}

			stopAll();
		};
	}, [
		applySize,
		containerRef,
		enabled,
		pageHiddenRef,
		resizeObserverRef,
		resizeTimeoutRef,
		startLoop,
		stopAll,
		stopBgLoop,
	]);
}
