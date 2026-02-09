import { useCallback, useEffect, useMemo, useRef } from 'react';

import { CONNECTION_ALPHA_FACTOR, CONNECTION_MIN_ALPHA } from '../constants';
import { roundCoord, setCanvasSize } from '../utils/canvas';
import { hexToRgba } from '../utils/color';
import { useDots } from './useDots';
import { useResolvedSpiderSettings } from './useResolvedSpiderSettings';
import { useSpiderLifecycle } from './useSpiderLifecycle';
import { useSpiderPointer } from './useSpiderPointer';

type Props = {
	enabled: boolean;

	dotCount?: number;
	dotColor: string;
	minDotSize?: number;
	maxDotSize?: number;
	connectRadius?: number;
	connectDots: boolean;
	connectDistance?: number;
	maxConnections?: number;
	disableOnTouch: boolean;
	driftSpeed?: number;
	lineWidth?: number;
	adaptive: boolean;
	pointerLineColor?: string;
};

export function useSpiderCanvas(props: Props) {
	const {
		enabled,

		dotCount,
		dotColor,
		minDotSize,
		maxDotSize,
		connectRadius,
		connectDots,
		connectDistance,
		maxConnections,
		disableOnTouch,
		driftSpeed,
		lineWidth,
		adaptive,
		pointerLineColor,
	} = props;

	const containerRef = useRef<HTMLDivElement | null>(null);
	const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const fgCanvasRef = useRef<HTMLCanvasElement | null>(null);

	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const resizeTimeoutRef = useRef<number | null>(null);
	const isTouchRef = useRef<boolean | null>(null);
	const pageHiddenRef = useRef(false);
	const pointerRef = useRef<{ x: number; y: number; isTouch?: boolean } | null>(null);

	const { dotsRef, generateDots, drawStaticDots, startBgLoop, stopBgLoop } = useDots();

	const { resolvedRef, computeResolved } = useResolvedSpiderSettings({
		dotCount,
		minDotSize,
		maxDotSize,
		connectRadius,
		connectDistance,
		driftSpeed,
		lineWidth,
		adaptive,
	});

	const clearFg = useCallback(() => {
		const fg = fgCanvasRef.current;
		if (!fg) return;
		const ctx = fg.getContext('2d');
		if (!ctx) return;
		const r = fg.getBoundingClientRect();
		ctx.clearRect(0, 0, r.width, r.height);
	}, []);

	const drawLinesToPointer = useCallback(() => {
		const fg = fgCanvasRef.current;
		if (!fg) return;
		const ctx = fg.getContext('2d');
		if (!ctx) return;

		const rect = fg.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);

		if (isTouchRef.current && disableOnTouch) return;

		const pointer = pointerRef.current;
		if (!pointer) return;
		if (pointer.isTouch && disableOnTouch) return;

		const resolved = resolvedRef.current;
		if (!resolved) return;

		ctx.lineWidth = resolved.lineWidth;

		for (const d of dotsRef.current) {
			const dx = pointer.x - d.x;
			const dy = pointer.y - d.y;
			const dist = Math.hypot(dx, dy);

			if (dist < resolved.pointerRadius) {
				const raw = 1 - dist / resolved.pointerRadius;
				const alpha = Math.max(CONNECTION_MIN_ALPHA, raw) * CONNECTION_ALPHA_FACTOR;

				ctx.strokeStyle = pointerLineColor
					? hexToRgba(pointerLineColor, alpha)
					: hexToRgba(d.color || '#000', alpha);

				ctx.beginPath();
				ctx.moveTo(roundCoord(d.x), roundCoord(d.y));
				ctx.lineTo(roundCoord(pointer.x), roundCoord(pointer.y));
				ctx.stroke();
			}
		}
	}, [disableOnTouch, dotsRef, pointerLineColor, resolvedRef, pointerRef]);

	const { attachPointerListeners, detachPointerListeners } = useSpiderPointer({
		enabled,
		disableOnTouch,
		containerRef,
		pointerRef,
		clearFg,
		drawLinesToPointer,
	});

	const applySize = useCallback(
		(width: number, height: number) => {
			const bg = bgCanvasRef.current;
			const fg = fgCanvasRef.current;
			if (!bg || !fg) return;

			setCanvasSize(bg, width, height);
			setCanvasSize(fg, width, height);

			const resolved = computeResolved(width, height);
			resolvedRef.current = resolved;

			generateDots(
				width,
				height,
				resolved.dotCount,
				resolved.minSize,
				resolved.maxSize,
				dotColor,
				resolved.driftSpeed
			);

			drawStaticDots(bg, {
				connectDistance: resolved.connectDistance,
				maxConnections,
				connectDots,
				isTouch: isTouchRef.current,
				lineWidth: resolved.lineWidth,
			});

			clearFg();
		},
		[
			clearFg,
			computeResolved,
			connectDots,
			dotColor,
			drawStaticDots,
			generateDots,
			maxConnections,
			resolvedRef,
		]
	);

	const startLoop = useCallback(() => {
		const bg = bgCanvasRef.current;
		if (!bg) return;

		const resolved = resolvedRef.current;
		if (!resolved) return;

		startBgLoop(
			bg,
			{
				connectDistance: resolved.connectDistance,
				maxConnections,
				connectDots,
				isTouch: isTouchRef.current,
				lineWidth: resolved.lineWidth,
			},
			() => {
				if (pointerRef.current) drawLinesToPointer();
			}
		);
	}, [connectDots, drawLinesToPointer, maxConnections, pointerRef, resolvedRef, startBgLoop]);

	const stopAll = useCallback(() => {
		stopBgLoop();
		pointerRef.current = null;
		clearFg();
	}, [clearFg, pointerRef, stopBgLoop]);

	// init: touch detect + initial size + listeners
	useEffect(() => {
		const container = containerRef.current;
		const bg = bgCanvasRef.current;
		const fg = fgCanvasRef.current;

		if (!container || !bg || !fg) return () => {};

		if (isTouchRef.current === null) {
			isTouchRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		}

		const rect = container.getBoundingClientRect();
		applySize(rect.width, rect.height);

		if (!enabled) {
			stopAll();
		}

		attachPointerListeners(container, isTouchRef.current);

		return () => {
			detachPointerListeners(container);
			stopAll();
		};
	}, [applySize, attachPointerListeners, detachPointerListeners, enabled, stopAll]);

	// lifecycle: resize + visibility + start/stop loop
	useSpiderLifecycle({
		enabled,
		containerRef,
		pageHiddenRef,
		resizeObserverRef,
		resizeTimeoutRef,
		applySize,
		startLoop,
		stopBgLoop,
		stopAll,
	});

	// re-run on settings changes (без тяжелых deps листов)
	const settingsKey = useMemo(
		() =>
			JSON.stringify({
				enabled,
				dotCount,
				dotColor,
				minDotSize,
				maxDotSize,
				connectRadius,
				connectDots,
				connectDistance,
				maxConnections,
				disableOnTouch,
				driftSpeed,
				lineWidth,
				adaptive,
				pointerLineColor,
			}),
		[
			adaptive,
			connectDistance,
			connectDots,
			connectRadius,
			disableOnTouch,
			dotColor,
			dotCount,
			driftSpeed,
			enabled,
			lineWidth,
			maxConnections,
			maxDotSize,
			minDotSize,
			pointerLineColor,
		]
	);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const rect = container.getBoundingClientRect();
		applySize(rect.width, rect.height);

		if (!enabled || document.hidden) {
			stopBgLoop();

			return;
		}

		stopBgLoop();
		startLoop();
	}, [settingsKey, applySize, enabled, startLoop, stopBgLoop]);

	return { containerRef, bgCanvasRef, fgCanvasRef };
}
