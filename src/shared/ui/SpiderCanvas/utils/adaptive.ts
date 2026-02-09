/* eslint-disable no-magic-numbers */
import {
	DEFAULT_CONNECT_DISTANCE,
	DEFAULT_CONNECT_RADIUS,
	DEFAULT_DOT_COUNT,
	DEFAULT_DRIFT_SPEED,
	DEFAULT_LINE_WIDTH,
	DEFAULT_MAX_DOT_SIZE,
	DEFAULT_MIN_DOT_SIZE,
} from '../constants';

export type AdaptiveProps = {
	dotCount: number;
	minSize: number;
	maxSize: number;
	driftSpeed: number;
	lineWidth: number;
	connectDistance: number;
	connectRadius: number;
	pointerRadius: number;
	scale: number;
};

const MIN_WIDTH = 320; // минимальная ширина для расчёта scale
const POINTER_RADIUS_SCALE = 0.85; // масштаб для pointerRadius относительно connectRadius
const DOT_COUNT_EXP = 1; // экспонента роста количества точек по ширине (немного >1)
const SIZE_GROWTH_FACTOR = 0.2; // как сильно растут размеры точек при увеличении width
const DRIFT_GROWTH_FACTOR = 0.12; // рост скорости дрейфа
const LINEWIDTH_GROWTH_FACTOR = 0.3; // рост толщины линий
const CONNECT_GROWTH_FACTOR = 0.5; // рост расстояния/радиуса соединений

const ADAPTIVE_MIN_DOTS_LOCAL = 8;
const ADAPTIVE_MAX_DOTS_LOCAL = 800;
const ADAPTIVE_MIN_SIZE_LOCAL = 3;
const ADAPTIVE_MAX_SIZE_LOCAL = 24;
const ADAPTIVE_MIN_DRIFT_LOCAL = 1;
const ADAPTIVE_MAX_DRIFT_LOCAL = 60;

export function computeAdaptiveProps(width: number, _height: number, dpr = 1): AdaptiveProps {
	const rawScale = Math.max(1, width / MIN_WIDTH);
	const deviceScale = Math.sqrt(Math.max(1, dpr));
	const scale = rawScale * deviceScale;

	let computedDots = Math.round(DEFAULT_DOT_COUNT * Math.pow(scale, DOT_COUNT_EXP));

	const minSizeBase = DEFAULT_MIN_DOT_SIZE;
	const maxSizeBase = DEFAULT_MAX_DOT_SIZE;
	let computedMinSize = Math.max(
		1,
		Math.round(minSizeBase * (1 + (scale - 1) * SIZE_GROWTH_FACTOR))
	);
	let computedMaxSize = Math.max(
		computedMinSize,
		Math.round(maxSizeBase * (1 + (scale - 1) * (SIZE_GROWTH_FACTOR + 0.05)))
	);
	let computedDrift = Math.round(
		DEFAULT_DRIFT_SPEED * Math.max(1, 1 + (scale - 1) * DRIFT_GROWTH_FACTOR)
	);
	const computedLineWidth = Math.max(
		1,
		Math.round(DEFAULT_LINE_WIDTH * Math.max(1, 1 + (scale - 1) * LINEWIDTH_GROWTH_FACTOR))
	);

	const computedConnectDistance = Math.max(
		24,
		Math.round(DEFAULT_CONNECT_DISTANCE * Math.max(1, 1 + (scale - 1) * CONNECT_GROWTH_FACTOR))
	);
	const computedConnectRadius = Math.max(
		24,
		Math.round(DEFAULT_CONNECT_RADIUS * Math.max(1, 1 + (scale - 1) * CONNECT_GROWTH_FACTOR))
	);

	const computedPointerRadius = Math.max(
		24,
		Math.round(computedConnectRadius * POINTER_RADIUS_SCALE)
	);

	computedDots = Math.max(ADAPTIVE_MIN_DOTS_LOCAL, Math.min(ADAPTIVE_MAX_DOTS_LOCAL, computedDots));
	computedMinSize = Math.max(
		ADAPTIVE_MIN_SIZE_LOCAL,
		Math.min(ADAPTIVE_MAX_SIZE_LOCAL, computedMinSize)
	);
	computedMaxSize = Math.max(computedMinSize, Math.min(ADAPTIVE_MAX_SIZE_LOCAL, computedMaxSize));
	computedDrift = Math.max(
		ADAPTIVE_MIN_DRIFT_LOCAL,
		Math.min(ADAPTIVE_MAX_DRIFT_LOCAL, computedDrift)
	);

	return {
		dotCount: computedDots,
		minSize: computedMinSize,
		maxSize: computedMaxSize,
		driftSpeed: computedDrift,
		lineWidth: computedLineWidth,
		connectDistance: computedConnectDistance,
		connectRadius: computedConnectRadius,
		pointerRadius: computedPointerRadius,
		scale,
	};
}
