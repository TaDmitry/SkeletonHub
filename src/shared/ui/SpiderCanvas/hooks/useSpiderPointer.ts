import { useCallback, useRef } from 'react';

const EMULATED_MOUSE_IGNORE_MS = 700;

export type Pointer = { x: number; y: number; isTouch?: boolean };

type Params = {
	enabled: boolean;
	disableOnTouch: boolean;

	containerRef: React.RefObject<HTMLDivElement | null>;

	pointerRef: React.RefObject<Pointer | null>;

	clearFg: () => void;
	drawLinesToPointer: () => void;
};

export function useSpiderPointer(params: Params) {
	const { enabled, disableOnTouch, containerRef, pointerRef, clearFg, drawLinesToPointer } = params;

	const lastTouchTsRef = useRef<number | null>(null);
	const tickingFgRef = useRef(false);
	const rafFgRef = useRef<number | null>(null);

	const onPointerMove = useCallback(
		(ev: PointerEvent | MouseEvent) => {
			if (!enabled) return;

			const isPointerEvent = typeof (ev as PointerEvent).pointerType === 'string';
			if (isPointerEvent) {
				const pe = ev as PointerEvent;
				if (pe.pointerType === 'touch') {
					lastTouchTsRef.current = Date.now();
					pointerRef.current = null;
					clearFg();

					return;
				}
			} else {
				const last = lastTouchTsRef.current;
				if (last && Date.now() - last < EMULATED_MOUSE_IGNORE_MS) return;
			}

			const container = containerRef.current;
			if (!container) return;

			const rect = container.getBoundingClientRect();
			const clientX = (ev as PointerEvent).clientX ?? (ev as MouseEvent).clientX ?? 0;
			const clientY = (ev as PointerEvent).clientY ?? (ev as MouseEvent).clientY ?? 0;

			pointerRef.current = { x: clientX - rect.left, y: clientY - rect.top, isTouch: false };

			if (!tickingFgRef.current) {
				tickingFgRef.current = true;
				rafFgRef.current = requestAnimationFrame(() => {
					drawLinesToPointer();
					tickingFgRef.current = false;
				});
			}
		},
		[clearFg, containerRef, drawLinesToPointer, enabled, pointerRef]
	);

	const onPointerOut = useCallback(() => {
		pointerRef.current = null;
		clearFg();
	}, [clearFg, pointerRef]);

	const onTouchStart = useCallback(() => {
		lastTouchTsRef.current = Date.now();
		pointerRef.current = null;
		clearFg();
	}, [clearFg, pointerRef]);

	const attachPointerListeners = useCallback(
		(container: HTMLDivElement, isTouch: boolean | null) => {
			// слушатели указателя/мыши только если не запрещено на тач-устройствах
			if (!(disableOnTouch && isTouch)) {
				if (window.PointerEvent) {
					container.addEventListener('pointermove', onPointerMove);
					container.addEventListener('pointerout', onPointerOut);
				} else {
					container.addEventListener('mousemove', onPointerMove as never);
					container.addEventListener('mouseout', onPointerOut as never);
				}
			}

			// всегда слушаем touchstart (чтобы отсечь эмулированную мышь и очистить FG)
			container.addEventListener('touchstart', onTouchStart, { passive: true });
		},
		[disableOnTouch, onPointerMove, onPointerOut, onTouchStart]
	);

	const detachPointerListeners = useCallback(
		(container: HTMLDivElement) => {
			if (window.PointerEvent) {
				container.removeEventListener('pointermove', onPointerMove);
				container.removeEventListener('pointerout', onPointerOut);
			} else {
				container.removeEventListener('mousemove', onPointerMove as never);
				container.removeEventListener('mouseout', onPointerOut as never);
			}
			container.removeEventListener('touchstart', onTouchStart as never);

			if (rafFgRef.current) {
				cancelAnimationFrame(rafFgRef.current);
				rafFgRef.current = null;
			}
			tickingFgRef.current = false;
		},
		[onPointerMove, onPointerOut, onTouchStart]
	);

	return {
		pointerRef,
		lastTouchTsRef,
		attachPointerListeners,
		detachPointerListeners,
	};
}
