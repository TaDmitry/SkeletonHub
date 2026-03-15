/* eslint-disable no-magic-numbers */
import { useCallback, useRef } from 'react';

import {
	CONNECTION_ALPHA_FACTOR,
	CONNECTION_MIN_ALPHA,
	DEFAULT_MAX_CONNECTIONS,
	MS_IN_SECOND,
} from '../constants';
import { roundCoord } from '../utils/canvas';

const TWO_PI = Math.PI * 2; // локально используется только в генерации точек
const DRIFT_RANDOM_BASE = 0.2; // часть случайного множителя скорости
const DRIFT_RANDOM_RANGE = 0.6; // размах случайного множителя скорости
const SPATIAL_HASH_THRESHOLD = 200; // при каком количестве точек включать spatial-hash
const MIN_CELL_SIZE = 10; // минимальный размер клетки spatial-hash

export type Dot = {
	x: number;
	y: number;
	size: number;
	color: string;
	vx: number;
	vy: number;
};

type Grid = Map<string, number[]>;
type CellCoord = { gx: number; gy: number };

function buildGrid(dots: Dot[], cellSize: number): Grid {
	const map = new Map<string, number[]>();

	for (let i = 0; i < dots.length; i++) {
		const d = dots[i];
		const gx = Math.floor(d.x / cellSize);
		const gy = Math.floor(d.y / cellSize);
		const key = `${gx},${gy}`;

		const bucket = map.get(key);
		if (bucket) bucket.push(i);
		else map.set(key, [i]);
	}

	return map;
}

function getAlpha(dist: number, connectDistance: number) {
	return Math.max(CONNECTION_MIN_ALPHA, 1 - dist / connectDistance) * CONNECTION_ALPHA_FACTOR;
}

function drawLine(ctx: CanvasRenderingContext2D, a: Dot, b: Dot, alpha: number, lineWidth: number) {
	const prevAlpha = ctx.globalAlpha;

	ctx.beginPath();
	ctx.strokeStyle = a.color;
	ctx.globalAlpha = alpha;
	ctx.moveTo(roundCoord(a.x), roundCoord(a.y));
	ctx.lineTo(roundCoord(b.x), roundCoord(b.y));
	ctx.lineWidth = lineWidth;
	ctx.stroke();

	ctx.globalAlpha = prevAlpha;
}

function tryConnectPair(
	ctx: CanvasRenderingContext2D,
	a: Dot,
	b: Dot,
	connectDistSq: number,
	connectDistance: number,
	lineWidth: number
) {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const distSq = dx * dx + dy * dy;

	if (distSq > connectDistSq) return false;

	const dist = Math.sqrt(distSq);
	const alpha = getAlpha(dist, connectDistance);

	drawLine(ctx, a, b, alpha, lineWidth);

	return true;
}

function getCellCoord(d: Dot, cell: number): CellCoord {
	return {
		gx: Math.floor(d.x / cell),
		gy: Math.floor(d.y / cell),
	};
}

function forEachNeighborKey(base: CellCoord, onKey: (key: string) => boolean) {
	for (let ox = -1; ox <= 1; ox++) {
		for (let oy = -1; oy <= 1; oy++) {
			const key = `${base.gx + ox},${base.gy + oy}`;
			if (onKey(key)) return;
		}
	}
}

function connectFromBucket(
	ctx: CanvasRenderingContext2D,
	dots: Dot[],
	bucket: number[],
	i: number,
	maxConn: number,
	connectDistSq: number,
	connectDistance: number,
	lineWidth: number,
	connections: number
) {
	const a = dots[i];

	for (const j of bucket) {
		if (j <= i) continue;
		if (connections >= maxConn) break;

		const b = dots[j];

		if (tryConnectPair(ctx, a, b, connectDistSq, connectDistance, lineWidth)) {
			connections++;
		}
	}

	return connections;
}

function drawConnectionsSpatialHash(
	ctx: CanvasRenderingContext2D,
	dots: Dot[],
	connectDistance: number,
	maxConn: number,
	lineWidth: number
) {
	const cell = Math.max(MIN_CELL_SIZE, Math.round(connectDistance));
	const grid = buildGrid(dots, cell);
	const connectDistSq = connectDistance * connectDistance;

	for (let i = 0; i < dots.length; i++) {
		let connections = 0;
		const base = getCellCoord(dots[i], cell);

		forEachNeighborKey(base, (key) => {
			if (connections >= maxConn) return true;

			const bucket = grid.get(key);
			if (!bucket) return false;

			connections = connectFromBucket(
				ctx,
				dots,
				bucket,
				i,
				maxConn,
				connectDistSq,
				connectDistance,
				lineWidth,
				connections
			);

			return connections >= maxConn;
		});
	}
}

function drawConnectionsBruteforce(
	ctx: CanvasRenderingContext2D,
	dots: Dot[],
	connectDistance: number,
	maxConn: number,
	lineWidth: number
) {
	const connectDistSq = connectDistance * connectDistance;

	for (let i = 0; i < dots.length; i++) {
		let connections = 0;
		const a = dots[i];

		for (let j = i + 1; j < dots.length; j++) {
			if (connections >= maxConn) break;

			const b = dots[j];

			if (tryConnectPair(ctx, a, b, connectDistSq, connectDistance, lineWidth)) {
				connections++;
			}
		}
	}
}

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
			const n = Math.max(1, Math.floor(count));

			const arr: Dot[] = new Array(n).fill(0).map(() => {
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
			_isTouch: boolean | null,
			lineWidth: number
		) => {
			if (!connectDots) return;

			const dots = dotsRef.current;
			if (dots.length === 0) return;

			const maxConn = typeof maxConnections === 'number' ? maxConnections : DEFAULT_MAX_CONNECTIONS;

			if (dots.length >= SPATIAL_HASH_THRESHOLD) {
				drawConnectionsSpatialHash(ctx, dots, connectDistance, maxConn, lineWidth);

				return;
			}

			drawConnectionsBruteforce(ctx, dots, connectDistance, maxConn, lineWidth);
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

			drawConnectionsBetweenDots(
				ctx,
				options.connectDistance,
				options.maxConnections,
				!!options.connectDots,
				options.isTouch,
				options.lineWidth
			);

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

				const prev = lastTsRef.current!;
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

				drawStaticDots(bgCanvas, drawStaticOptions);
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
