import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import {
	CONNECTION_ALPHA_FACTOR,
	CONNECTION_MIN_ALPHA,
	DEFAULT_CONNECT_DISTANCE,
	DEFAULT_DOT_COUNT,
	DEFAULT_DRIFT_SPEED,
	DEFAULT_LINE_WIDTH,
	DEFAULT_MAX_DOT_SIZE,
	DEFAULT_MIN_DOT_SIZE,
} from '../constants';
import { useDots } from '../hooks/useDots';
import { computeAdaptiveProps } from '../utils/adaptive';
import { roundCoord, setCanvasSize } from '../utils/canvas';
import { hexToRgba } from '../utils/color';

type Props = {
	dotCount?: number;
	dotColor: string;
	minDotSize?: number;
	maxDotSize?: number;
	connectRadius?: number | undefined;
	connectDots: boolean;
	connectDistance?: number | undefined;
	maxConnections?: number;
	disableOnTouch: boolean;
	driftSpeed?: number | undefined;
	lineWidth?: number | undefined;
	adaptive: boolean;
	pointerLineColor?: string | undefined;
};

// игнорировать эмулированные события мыши (mousemove) в течение 700 мс после касания
const EMULATED_MOUSE_IGNORE_MS = 700;

export function useSpiderCanvas(props: Props) {
	const {
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

	// refs для DOM-узлов
	const containerRef = useRef<HTMLDivElement | null>(null);
	const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const fgCanvasRef = useRef<HTMLCanvasElement | null>(null);

	// refs для состояния (без перерисовки компонента)
	const pointerRef = useRef<{ x: number; y: number; isTouch?: boolean } | null>(null);
	const tickingFgRef = useRef(false);
	const rafFgRef = useRef<number | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const resizeTimeoutRef = useRef<number | null>(null);
	const lastTouchTsRef = useRef<number | null>(null);
	const isTouchRef = useRef<boolean | null>(null);
	const pageHiddenRef = useRef(false);

	// хук для управления точками (логика в useDots)
	const { dotsRef, generateDots, drawStaticDots, startBgLoop, stopBgLoop } = useDots(() => {});

	// вычислить адаптивные параметры для указанного размера (учитывая devicePixelRatio)
	const computeForCurrent = useCallback((w: number, h: number) => {
		return computeAdaptiveProps(w, h, window.devicePixelRatio || 1);
	}, []);

	// отрисовка линий до указателя на fg canvas — ограничено requestAnimationFrame (через onPointerMove)
	const drawLinesToPointer = useCallback(() => {
		const fg = fgCanvasRef.current;
		if (!fg) return;
		const ctx = fg.getContext('2d');
		if (!ctx) return;
		const rect = fg.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);

		// глобальная проверка: если устройство сенсорное и пользователь отключил линии указателя — прекратить
		if (isTouchRef.current && disableOnTouch) return;

		const pointer = pointerRef.current;
		if (!pointer) return;
		if (pointer.isTouch && disableOnTouch) return; // явно: не рисовать для тача

		const container = containerRef.current;
		const width = container?.getBoundingClientRect().width ?? rect.width;
		const height = container?.getBoundingClientRect().height ?? rect.height;

		const adaptiveNow = computeForCurrent(width, height);
		const usePointerRadius =
			connectRadius ?? adaptiveNow.pointerRadius ?? adaptiveNow.connectRadius;
		const useLineWidth = lineWidth ?? adaptiveNow.lineWidth;

		ctx.lineWidth = useLineWidth;

		for (const d of dotsRef.current) {
			const dx = pointer.x - d.x;
			const dy = pointer.y - d.y;
			const dist = Math.hypot(dx, dy);
			if (dist < usePointerRadius) {
				const raw = 1 - dist / usePointerRadius;
				const alpha = Math.max(CONNECTION_MIN_ALPHA, raw) * CONNECTION_ALPHA_FACTOR;

				if (pointerLineColor) {
					ctx.strokeStyle = hexToRgba(pointerLineColor, alpha);
				} else {
					ctx.strokeStyle = hexToRgba(d.color || '#000', alpha);
				}

				ctx.beginPath();
				ctx.moveTo(roundCoord(d.x), roundCoord(d.y));
				ctx.lineTo(roundCoord(pointer.x), roundCoord(pointer.y));
				ctx.stroke();
			}
		}
	}, [computeForCurrent, connectRadius, disableOnTouch, dotsRef, lineWidth, pointerLineColor]);

	// Обработчик указателя/мыши — фильтрует касания и эмулированную мышь после тача
	const onPointerMove = useCallback(
		(ev: PointerEvent | MouseEvent) => {
			const isPointerEvent = typeof (ev as PointerEvent).pointerType === 'string';
			if (isPointerEvent) {
				const pe = ev as PointerEvent;
				// если это реальный сенсорный указатель, отметить его и очистить рисунок указателя
				if (pe.pointerType === 'touch') {
					lastTouchTsRef.current = Date.now();
					pointerRef.current = null;
					const fg = fgCanvasRef.current;
					if (fg) {
						const ctx = fg.getContext('2d');
						if (ctx) {
							const r = fg.getBoundingClientRect();
							ctx.clearRect(0, 0, r.width, r.height);
						}
					}

					return;
				}
			} else {
				// может быть mousemove — игнорировать эмулированную мышь вскоре после тача
				const last = lastTouchTsRef.current;
				if (last && Date.now() - last < EMULATED_MOUSE_IGNORE_MS) {
					return;
				}
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
		[drawLinesToPointer]
	);

	// Обнуление указателя при выходе — очистка fg
	const onPointerOut = useCallback(() => {
		pointerRef.current = null;
		const fg = fgCanvasRef.current;
		if (!fg) return;
		const ctx = fg.getContext('2d');
		if (!ctx) return;
		const rect = fg.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);
	}, []);

	// Обработчик touchstart: пометить время последнего тача и очистить fg
	const onTouchStart = useCallback(() => {
		lastTouchTsRef.current = Date.now();
		pointerRef.current = null;
		const fg = fgCanvasRef.current;
		if (!fg) return;
		const ctx = fg.getContext('2d');
		if (!ctx) return;
		const r = fg.getBoundingClientRect();
		ctx.clearRect(0, 0, r.width, r.height);
	}, []);

	// начальное измерение и генерация точек (useLayoutEffect чтобы избежать мерцания)
	useLayoutEffect(() => {
		const container = containerRef.current;
		const bg = bgCanvasRef.current;
		const fg = fgCanvasRef.current;
		if (!container || !bg || !fg) return;

		const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		isTouchRef.current = isTouch;

		const rect = container.getBoundingClientRect();
		setCanvasSize(bg, rect.width, rect.height);
		setCanvasSize(fg, rect.width, rect.height);

		const adaptiveNow = adaptive ? computeForCurrent(rect.width, rect.height) : null;
		const useDotCount =
			typeof dotCount === 'number'
				? Math.max(1, Math.floor(dotCount))
				: (adaptiveNow?.dotCount ?? DEFAULT_DOT_COUNT);
		const useMinSize =
			typeof minDotSize === 'number' ? minDotSize : (adaptiveNow?.minSize ?? DEFAULT_MIN_DOT_SIZE);
		const useMaxSize =
			typeof maxDotSize === 'number' ? maxDotSize : (adaptiveNow?.maxSize ?? DEFAULT_MAX_DOT_SIZE);
		const useDrift =
			typeof driftSpeed === 'number'
				? driftSpeed
				: (adaptiveNow?.driftSpeed ?? DEFAULT_DRIFT_SPEED);
		const useConnectDistance =
			typeof connectDistance === 'number'
				? connectDistance
				: (adaptiveNow?.connectDistance ?? DEFAULT_CONNECT_DISTANCE);
		const useLineWidth =
			typeof lineWidth === 'number' ? lineWidth : (adaptiveNow?.lineWidth ?? DEFAULT_LINE_WIDTH);

		// сгенерировать точки под текущий размер
		generateDots(rect.width, rect.height, useDotCount, useMinSize, useMaxSize, dotColor, useDrift);

		// начальная отрисовка точек и связей
		drawStaticDots(bg, {
			connectDistance: useConnectDistance,
			maxConnections,
			connectDots,
			isTouch: isTouchRef.current,
			lineWidth: useLineWidth,
		});
		// очистка/отписка выполняется в основном эффекте (listeners + цикл)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // mount only

	// основной эффект: слушатели, наблюдатель изменения размера, фоновый цикл, обработка видимости
	useEffect(() => {
		const container = containerRef.current;
		const bg = bgCanvasRef.current;
		const fg = fgCanvasRef.current;
		if (!container || !bg || !fg) return () => {};

		const isTouch = isTouchRef.current;
		// добавляем слушатели указателя/мыши только если не отключаем линии при таче
		if (!(disableOnTouch && isTouch)) {
			if (window.PointerEvent) {
				container.addEventListener('pointermove', onPointerMove);
				container.addEventListener('pointerout', onPointerOut);
			} else {
				container.addEventListener('mousemove', onPointerMove as never);
				container.addEventListener('mouseout', onPointerOut as never);
			}
		}
		// всегда слушаем touchstart чтобы определить тач и очистить FG (предотвращает эмулированную мышь)
		container.addEventListener('touchstart', onTouchStart, { passive: true });

		// наблюдатель размера с дебаунсом (задержкой)
		const doResize = (width: number, height: number) => {
			// обновить размеры canvas'ов
			setCanvasSize(bg, width, height);
			setCanvasSize(fg, width, height);

			// пересчитать адаптивные параметры и сгенерировать новые точки под новый размер
			const adaptiveNow = adaptive ? computeForCurrent(width, height) : null;
			const safe =
				typeof dotCount === 'number'
					? Math.max(1, Math.floor(dotCount))
					: (adaptiveNow?.dotCount ?? DEFAULT_DOT_COUNT);
			const minS =
				typeof minDotSize === 'number'
					? minDotSize
					: (adaptiveNow?.minSize ?? DEFAULT_MIN_DOT_SIZE);
			const maxS =
				typeof maxDotSize === 'number'
					? maxDotSize
					: (adaptiveNow?.maxSize ?? DEFAULT_MAX_DOT_SIZE);
			const driftS =
				typeof driftSpeed === 'number'
					? driftSpeed
					: (adaptiveNow?.driftSpeed ?? DEFAULT_DRIFT_SPEED);
			const conD =
				typeof connectDistance === 'number'
					? connectDistance
					: (adaptiveNow?.connectDistance ?? DEFAULT_CONNECT_DISTANCE);
			const lW =
				typeof lineWidth === 'number' ? lineWidth : (adaptiveNow?.lineWidth ?? DEFAULT_LINE_WIDTH);

			generateDots(width, height, safe, minS, maxS, dotColor, driftS);
			drawStaticDots(bg, {
				connectDistance: conD,
				maxConnections,
				connectDots,
				isTouch: isTouchRef.current,
				lineWidth: lW,
			});

			// очистить fg после ресайза
			const fctx = fg.getContext('2d');
			if (fctx) fctx.clearRect(0, 0, width, height);
		};

		const RESIZE_DEBOUNCE = 120;
		resizeObserverRef.current = new ResizeObserver((entries) => {
			if (resizeTimeoutRef.current) {
				window.clearTimeout(resizeTimeoutRef.current);
			}
			resizeTimeoutRef.current = window.setTimeout(() => {
				for (const entry of entries) {
					const { width, height } = entry.contentRect;
					doResize(width, height);
				}
				resizeTimeoutRef.current = null;
			}, RESIZE_DEBOUNCE);
		});
		resizeObserverRef.current.observe(container);

		// обработка видимости страницы: при скрытии останавливаем фоновый цикл
		const onVisibility = () => {
			if (document.hidden) {
				pageHiddenRef.current = true;
				stopBgLoop();
			} else {
				pageHiddenRef.current = false;
				// перезапуск фонового цикла при возвращении на вкладку
				const rect = bg.getBoundingClientRect();
				const adaptiveNow = adaptive ? computeForCurrent(rect.width, rect.height) : null;
				const conD =
					typeof connectDistance === 'number'
						? connectDistance
						: (adaptiveNow?.connectDistance ?? DEFAULT_CONNECT_DISTANCE);
				const lW =
					typeof lineWidth === 'number'
						? lineWidth
						: (adaptiveNow?.lineWidth ?? DEFAULT_LINE_WIDTH);
				startBgLoop(
					bg,
					{
						connectDistance: conD,
						maxConnections,
						connectDots,
						isTouch: isTouchRef.current,
						lineWidth: lW,
					},
					() => {
						if (pointerRef.current) drawLinesToPointer();
					}
				);
			}
		};
		document.addEventListener('visibilitychange', onVisibility);

		// запуск фонового цикла при инициализации
		const rect = bg.getBoundingClientRect();
		const adaptiveNow = adaptive ? computeForCurrent(rect.width, rect.height) : null;
		const conD =
			typeof connectDistance === 'number'
				? connectDistance
				: (adaptiveNow?.connectDistance ?? DEFAULT_CONNECT_DISTANCE);
		const lW =
			typeof lineWidth === 'number' ? lineWidth : (adaptiveNow?.lineWidth ?? DEFAULT_LINE_WIDTH);
		startBgLoop(
			bg,
			{
				connectDistance: conD,
				maxConnections,
				connectDots,
				isTouch: isTouchRef.current,
				lineWidth: lW,
			},
			() => {
				if (pointerRef.current) drawLinesToPointer();
			}
		);

		// очистка при размонтировании: удалить слушатели, остановить циклы, очистить таймеры/raf
		return () => {
			if (window.PointerEvent) {
				container.removeEventListener('pointermove', onPointerMove);
				container.removeEventListener('pointerout', onPointerOut);
			} else {
				container.removeEventListener('mousemove', onPointerMove as never);
				container.removeEventListener('mouseout', onPointerOut as never);
			}
			container.removeEventListener('touchstart', onTouchStart as never);
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect();
				resizeObserverRef.current = null;
			}
			if (resizeTimeoutRef.current) {
				window.clearTimeout(resizeTimeoutRef.current);
				resizeTimeoutRef.current = null;
			}
			document.removeEventListener('visibilitychange', onVisibility);
			stopBgLoop();
			if (rafFgRef.current) {
				cancelAnimationFrame(rafFgRef.current);
				rafFgRef.current = null;
			}
		};
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
		adaptive,
		generateDots,
		drawStaticDots,
		startBgLoop,
		stopBgLoop,
		onPointerMove,
		onPointerOut,
		drawLinesToPointer,
		computeForCurrent,
		onTouchStart,
	]);

	// возвращаем рефы для привязки в компоненте
	return {
		containerRef,
		bgCanvasRef,
		fgCanvasRef,
	};
}
