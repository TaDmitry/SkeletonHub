/* eslint-disable no-magic-numbers */
// src/shared/components/SpiderCanvas/utils/adaptive.ts

import {
	ADAPTIVE_BASE_AREA,
	ADAPTIVE_MAX_DOTS,
	ADAPTIVE_MAX_DRIFT,
	ADAPTIVE_MAX_SIZE,
	ADAPTIVE_MIN_DOTS,
	ADAPTIVE_MIN_DRIFT,
	ADAPTIVE_MIN_SIZE,
	DEFAULT_CONNECT_DISTANCE,
	DEFAULT_CONNECT_RADIUS,
	DEFAULT_DOT_COUNT,
	DEFAULT_DRIFT_SPEED,
	DEFAULT_LINE_WIDTH,
	DEFAULT_MAX_DOT_SIZE,
	DEFAULT_MIN_DOT_SIZE,
} from '../constants';

/**
 * Пороговые значения экранов:
 * - small: width <= 768
 * - large: width >= 1920
 */
const SMALL_WIDTH = 768;
const LARGE_WIDTH = 1920;

/**
 * Мультипликаторы для small/large экранов
 * - size: 0.5x на small, 2x на large
 * - count: 0.75x на small, 1.5x на large
 * - drift: 0.7x на small, 1.4x на large
 * - lineWidth: 1.0x на small, 2.0x на large
 * - connectDistance: 0.9x на small, 1.6x на large
 * - connectRadius (для лучей к курсору): 0.9x на small, 1.6x на large
 */
const SIZE_MULT_SMALL = 0.5;
const SIZE_MULT_LARGE = 2.0;
const COUNT_MULT_SMALL = 0.75;
const COUNT_MULT_LARGE = 1.5;
const DRIFT_MULT_SMALL = 0.7;
const DRIFT_MULT_LARGE = 1.4;
const LINEWIDTH_MULT_SMALL = 1.0;
const LINEWIDTH_MULT_LARGE = 2.0;
const CONNECT_DIST_MULT_SMALL = 0.9;
const CONNECT_DIST_MULT_LARGE = 1.6;
const CONNECT_RADIUS_MULT_SMALL = 0.9;
const CONNECT_RADIUS_MULT_LARGE = 1.6;

/**
 * Базовая масштабируемая формула: растёт с площадью и DPR,
 * затем применяются агрессивные мультипликаторы порогов.
 */
export function computeAdaptiveProps(width: number, height: number, dpr = 1) {
	const area = Math.max(1, width * height * dpr);
	const scale = Math.sqrt(area / ADAPTIVE_BASE_AREA);

	// Базовое количество точек
	let computedDots = Math.round(DEFAULT_DOT_COUNT * scale);

	// Базовые размеры точек
	const baseSizeScale = 1 + (scale - 1) * 0.25;
	let computedMinSize = Math.round(DEFAULT_MIN_DOT_SIZE * baseSizeScale);
	let computedMaxSize = Math.round(DEFAULT_MAX_DOT_SIZE * baseSizeScale);

	// Базовая скорость дрейфа
	let computedDrift = Math.round(DEFAULT_DRIFT_SPEED * (1 + (scale - 1) * 0.3));

	// Базовые соединительные параметры (масштабируем относительно scale)
	let lineWidth = Math.max(1, Math.round(DEFAULT_LINE_WIDTH * (1 + (scale - 1) * 0.5)));
	let connectDistance = Math.round(DEFAULT_CONNECT_DISTANCE * (1 + (scale - 1) * 0.6));
	let connectRadius = Math.round(DEFAULT_CONNECT_RADIUS * (1 + (scale - 1) * 0.6));

	// Применяем агрессивные мультипликаторы по ширине
	if (width <= SMALL_WIDTH) {
		computedDots = Math.round(computedDots * COUNT_MULT_SMALL);
		computedMinSize = Math.max(1, Math.round(computedMinSize * SIZE_MULT_SMALL));
		computedMaxSize = Math.max(computedMinSize, Math.round(computedMaxSize * SIZE_MULT_SMALL));
		computedDrift = Math.max(1, Math.round(computedDrift * DRIFT_MULT_SMALL));
		lineWidth = Math.max(1, Math.round(lineWidth * LINEWIDTH_MULT_SMALL));
		connectDistance = Math.max(24, Math.round(connectDistance * CONNECT_DIST_MULT_SMALL));
		connectRadius = Math.max(48, Math.round(connectRadius * CONNECT_RADIUS_MULT_SMALL));
	} else if (width >= LARGE_WIDTH) {
		computedDots = Math.round(computedDots * COUNT_MULT_LARGE);
		computedMinSize = Math.round(computedMinSize * SIZE_MULT_LARGE);
		computedMaxSize = Math.max(computedMinSize, Math.round(computedMaxSize * SIZE_MULT_LARGE));
		computedDrift = Math.round(computedDrift * DRIFT_MULT_LARGE);
		lineWidth = Math.max(1, Math.round(lineWidth * LINEWIDTH_MULT_LARGE));
		connectDistance = Math.round(connectDistance * CONNECT_DIST_MULT_LARGE);
		connectRadius = Math.round(connectRadius * CONNECT_RADIUS_MULT_LARGE);
	}

	// Клапаны нижних/верхних границ
	const dotCountClamped = Math.max(ADAPTIVE_MIN_DOTS, Math.min(ADAPTIVE_MAX_DOTS, computedDots));
	const minSizeClamped = Math.max(ADAPTIVE_MIN_SIZE, Math.min(ADAPTIVE_MAX_SIZE, computedMinSize));
	const maxSizeClamped = Math.max(minSizeClamped, Math.min(ADAPTIVE_MAX_SIZE, computedMaxSize));
	const driftClamped = Math.max(ADAPTIVE_MIN_DRIFT, Math.min(ADAPTIVE_MAX_DRIFT, computedDrift));

	return {
		dotCount: dotCountClamped,
		minSize: minSizeClamped,
		maxSize: maxSizeClamped,
		driftSpeed: driftClamped,
		lineWidth,
		connectDistance,
		connectRadius,
		scale,
	};
}
