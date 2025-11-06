// src/shared/components/SpiderCanvas/hooks/useDots.ts
import { useCallback, useRef } from 'react';

import {
	CONNECTION_ALPHA_FACTOR,
	CONNECTION_MIN_ALPHA,
	DEFAULT_MAX_CONNECTIONS,
	DRIFT_RANDOM_BASE,
	DRIFT_RANDOM_RANGE,
	MS_IN_SECOND,
	TWO_PI,
} from '../constants';
import { roundCoord } from '../utils/canvas';

export type Dot = {
	x: number;
	y: number;
	size: number;
	color: string;
	vx: number;
	vy: number;
};

export function useDots() {
	const dotsRef = useRef<Dot[]>([]);
	const rafBgRef = useRef<number | null>(null);
	const lastTsRef = useRef<number | null>(null);

	const generateDots = useCallback(
		(
			width: number,
			height: number,
			count: number,
			minSize: number,
			maxSize: number,
			dotColor: string,
			driftSpeed: number
		) => {
			const arr: Dot[] = new Array(Math.max(1, Math.floor(count))).fill(null).map(() => {
				const angle = Math.random() * TWO_PI;
				const randFactor = Math.random() * DRIFT_RANDOM_RANGE + DRIFT_RANDOM_BASE;
				const speed = randFactor * driftSpeed;

				return {
					x: Math.random() * width,
					y: Math.random() * height,
					size: Math.random() * (maxSize - minSize) + minSize,
					color: dotColor,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
				};
			});
			dotsRef.current = arr;
		},
		[]
	);

	const drawConnectionsBetweenDots = useCallback(
		(
			ctx: CanvasRenderingContext2D,
			connectDistance: number,
			maxConnections: number | undefined,
			connectDots: boolean,
			isTouch: boolean | null,
			lineWidth: number
		) => {
			if (!connectDots) return;
			if (!ctx) return;
			if (!dotsRef.current.length) return;

			const dots = dotsRef.current;
			const n = dots.length;
			const maxConn = typeof maxConnections === 'number' ? maxConnections : DEFAULT_MAX_CONNECTIONS;

			for (let i = 0; i < n; i++) {
				let connections = 0;
				const a = dots[i];
				for (let j = i + 1; j < n && connections < maxConn; j++) {
					const b = dots[j];
					const dx = a.x - b.x;
					const dy = a.y - b.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist <= connectDistance) {
						const alpha =
							Math.max(CONNECTION_MIN_ALPHA, 1 - dist / connectDistance) * CONNECTION_ALPHA_FACTOR;
						const prevAlpha = ctx.globalAlpha;
						ctx.beginPath();
						ctx.strokeStyle = a.color;
						ctx.globalAlpha = alpha;
						ctx.moveTo(roundCoord(a.x), roundCoord(a.y));
						ctx.lineTo(roundCoord(b.x), roundCoord(b.y));
						ctx.lineWidth = lineWidth;
						ctx.stroke();
						ctx.globalAlpha = prevAlpha;
						connections++;
					}
				}
			}
		},
		[]
	);

	const drawStaticDots = useCallback(
		(
			bgCanvas: HTMLCanvasElement | null,
			options: {
				connectDistance: number;
				maxConnections?: number;
				connectDots?: boolean;
				isTouch: boolean | null;
				lineWidth: number;
			}
		) => {
			if (!bgCanvas) return;
			const ctx = bgCanvas.getContext('2d');
			if (!ctx) return;

			const rect = bgCanvas.getBoundingClientRect();
			const { width } = rect;
			const { height } = rect;
			ctx.clearRect(0, 0, width, height);

			// connections first (so points are on top)
			drawConnectionsBetweenDots(
				ctx,
				options.connectDistance,
				options.maxConnections,
				!!options.connectDots,
				options.isTouch,
				options.lineWidth
			);

			// draw dots
			for (const d of dotsRef.current) {
				ctx.beginPath();
				ctx.fillStyle = d.color;
				ctx.arc(roundCoord(d.x), roundCoord(d.y), d.size, 0, TWO_PI);
				ctx.fill();
			}
		},
		[drawConnectionsBetweenDots]
	);

	const startBgLoop = useCallback(
		(
			bgCanvas: HTMLCanvasElement | null,
			drawStaticOptions: {
				connectDistance: number;
				maxConnections?: number;
				connectDots?: boolean;
				isTouch: boolean | null;
				lineWidth: number;
			},
			onFrame?: () => void
		) => {
			if (!bgCanvas) return;

			const loop = (ts: number) => {
				if (lastTsRef.current === null) lastTsRef.current = ts;
				const prev = lastTsRef.current;
				const deltaMs = ts - prev;
				lastTsRef.current = ts;
				const deltaSec = deltaMs / MS_IN_SECOND;

				const rect = bgCanvas.getBoundingClientRect();
				const { width } = rect;
				const { height } = rect;

				for (const d of dotsRef.current) {
					d.x += d.vx * deltaSec;
					d.y += d.vy * deltaSec;
					if (d.x < -d.size) d.x = width + d.size;
					if (d.x > width + d.size) d.x = -d.size;
					if (d.y < -d.size) d.y = height + d.size;
					if (d.y > height + d.size) d.y = -d.size;
				}

				// redraw background (connections + dots)
				drawStaticDots(bgCanvas, drawStaticOptions);

				// optional front update
				if (typeof onFrame === 'function') onFrame();

				rafBgRef.current = requestAnimationFrame(loop);
			};

			rafBgRef.current = requestAnimationFrame(loop);
		},
		[drawStaticDots]
	);

	const stopBgLoop = useCallback(() => {
		if (rafBgRef.current) {
			cancelAnimationFrame(rafBgRef.current);
			rafBgRef.current = null;
			lastTsRef.current = null;
		}
	}, []);

	return {
		dotsRef,
		generateDots,
		drawStaticDots,
		startBgLoop,
		stopBgLoop,
	};
}
