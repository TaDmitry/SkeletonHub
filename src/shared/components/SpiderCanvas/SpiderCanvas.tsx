// src/shared/components/SpiderCanvas/SpiderCanvas.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';

import { DEFAULT_DOT_COLOR, DEFAULT_MAX_CONNECTIONS } from './constants';
import { useDots } from './hooks/useDots';
import { computeAdaptiveProps } from './utils/adaptive';
import { roundCoord, setCanvasSize } from './utils/canvas';

import styles from './SpiderCanvas.module.scss';

export interface SpiderCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
	dotCount?: number;
	dotColor?: string;
	minDotSize?: number;
	maxDotSize?: number;
	connectRadius?: number;
	connectDots?: boolean;
	connectDistance?: number;
	maxConnections?: number;
	disableOnTouch?: boolean;
	driftSpeed?: number;
	lineWidth?: number;
}

export default function SpiderCanvas({
	className,
	dotCount,
	dotColor = DEFAULT_DOT_COLOR,
	minDotSize,
	maxDotSize,
	connectRadius,
	connectDots = true,
	connectDistance,
	maxConnections = DEFAULT_MAX_CONNECTIONS,
	disableOnTouch = false,
	driftSpeed,
	lineWidth,
	...rest
}: SpiderCanvasProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const fgCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const pointerRef = useRef<{ x: number; y: number } | null>(null);
	const tickingFgRef = useRef(false);
	const rafFgRef = useRef<number | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const isTouchRef = useRef<boolean | null>(null);

	const { dotsRef, generateDots, drawStaticDots, startBgLoop, stopBgLoop } = useDots();

	// линии от точек к курсору (foreground)
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

		// адаптивный радиус и толщина линий для курсора
		const container = containerRef.current;
		const width = container?.getBoundingClientRect().width ?? rect.width;
		const height = container?.getBoundingClientRect().height ?? rect.height;
		const adaptive = computeAdaptiveProps(width, height, window.devicePixelRatio || 1);
		const useConnectRadius = connectRadius ?? adaptive.connectRadius;
		const useLineWidth = lineWidth ?? adaptive.lineWidth;

		ctx.lineWidth = useLineWidth;
		for (const d of dotsRef.current) {
			const dx = pointer.x - d.x;
			const dy = pointer.y - d.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < useConnectRadius) {
				ctx.beginPath();
				ctx.strokeStyle = d.color;
				ctx.moveTo(roundCoord(d.x), roundCoord(d.y));
				ctx.lineTo(roundCoord(pointer.x), roundCoord(pointer.y));
				ctx.stroke();
			}
		}
	}, [connectRadius, disableOnTouch, dotsRef, lineWidth]);

	// обновление курсора и планирование перерисовки
	const onPointerMove = useCallback(
		(ev: PointerEvent | MouseEvent) => {
			const container = containerRef.current;
			if (!container) return;
			const rect = container.getBoundingClientRect();
			const clientX = (ev as PointerEvent).clientX ?? (ev as MouseEvent).clientX ?? 0;
			const clientY = (ev as PointerEvent).clientY ?? (ev as MouseEvent).clientY ?? 0;
			pointerRef.current = { x: clientX - rect.left, y: clientY - rect.top };

			if (!tickingFgRef.current) {
				tickingFgRef.current = true;
				rafFgRef.current = requestAnimationFrame(() => {
					drawLinesToPointer();
					tickingFgRef.current = false;
				});
			}
		},
		[drawLinesToPointer]
	);

	const onPointerOut = useCallback(() => {
		pointerRef.current = null;
		const fg = fgCanvasRef.current;
		if (!fg) return;
		const ctx = fg.getContext('2d');
		if (!ctx) return;
		const rect = fg.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		const bg = bgCanvasRef.current;
		const fg = fgCanvasRef.current;

		if (!container || !bg || !fg) {
			return () => {};
		}

		const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		isTouchRef.current = isTouch;

		const rect = container.getBoundingClientRect();
		setCanvasSize(bg, rect.width, rect.height);
		setCanvasSize(fg, rect.width, rect.height);

		// адаптивные значения
		const adaptive = computeAdaptiveProps(rect.width, rect.height, window.devicePixelRatio || 1);
		const useDotCount = dotCount ?? adaptive.dotCount;
		const useMinSize = minDotSize ?? adaptive.minSize;
		const useMaxSize = maxDotSize ?? adaptive.maxSize;
		const useDriftSpeed = driftSpeed ?? adaptive.driftSpeed;
		const useConnectDistance = connectDistance ?? adaptive.connectDistance;
		const useLineWidth = lineWidth ?? adaptive.lineWidth;

		// генерим точки
		generateDots(
			rect.width,
			rect.height,
			useDotCount,
			useMinSize,
			useMaxSize,
			dotColor,
			useDriftSpeed
		);

		const localIsTouch = isTouchRef.current;

		// стартовый кадр
		drawStaticDots(bg, {
			connectDistance: useConnectDistance,
			maxConnections,
			connectDots,
			isTouch: localIsTouch,
			lineWidth: useLineWidth,
		});

		// указатель
		if (!(disableOnTouch && isTouch)) {
			if (window.PointerEvent) {
				container.addEventListener('pointermove', onPointerMove);
				container.addEventListener('pointerout', onPointerOut);
			} else {
				container.addEventListener('mousemove', onPointerMove as any);
				container.addEventListener('mouseout', onPointerOut as any);
			}
		}

		// ресайз — пересчёт адаптивных значений
		resizeObserverRef.current = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				setCanvasSize(bg, width, height);
				setCanvasSize(fg, width, height);

				const adaptiveNow = computeAdaptiveProps(width, height, window.devicePixelRatio || 1);
				const safe = dotCount ?? adaptiveNow.dotCount;
				const minS = minDotSize ?? adaptiveNow.minSize;
				const maxS = maxDotSize ?? adaptiveNow.maxSize;
				const driftS = driftSpeed ?? adaptiveNow.driftSpeed;
				const conD = connectDistance ?? adaptiveNow.connectDistance;
				const lW = lineWidth ?? adaptiveNow.lineWidth;

				generateDots(width, height, safe, minS, maxS, dotColor, driftS);
				drawStaticDots(bg, {
					connectDistance: conD,
					maxConnections,
					connectDots,
					isTouch: localIsTouch,
					lineWidth: lW,
				});

				const fctx = fg.getContext('2d');
				if (fctx) fctx.clearRect(0, 0, width, height);
			}
		});
		resizeObserverRef.current.observe(container);

		// фоновая анимация
		startBgLoop(
			bg,
			{
				connectDistance: useConnectDistance,
				maxConnections,
				connectDots,
				isTouch: localIsTouch,
				lineWidth: useLineWidth,
			},
			() => {
				if (pointerRef.current) drawLinesToPointer();
			}
		);

		// cleanup
		return () => {
			if (window.PointerEvent) {
				container.removeEventListener('pointermove', onPointerMove);
				container.removeEventListener('pointerout', onPointerOut);
			} else {
				container.removeEventListener('mousemove', onPointerMove as any);
				container.removeEventListener('mouseout', onPointerOut as any);
			}
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect();
				resizeObserverRef.current = null;
			}
			stopBgLoop();
			if (rafFgRef.current) {
				cancelAnimationFrame(rafFgRef.current);
				rafFgRef.current = null;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		dotCount,
		dotColor,
		minDotSize,
		maxDotSize,
		connectRadius,
		connectDistance,
		connectDots,
		maxConnections,
		disableOnTouch,
		driftSpeed,
		lineWidth,
		generateDots,
		drawStaticDots,
		startBgLoop,
		stopBgLoop,
		onPointerMove,
		onPointerOut,
	]);

	return (
		<div
			ref={containerRef}
			className={clsx(styles.container, className)}
			{...rest}
		>
			<canvas
				ref={bgCanvasRef}
				className={styles.canvasBg}
				aria-hidden
			/>
			<canvas
				ref={fgCanvasRef}
				className={styles.canvasFg}
				aria-hidden
			/>
		</div>
	);
}
