import { useCallback, useRef } from 'react';

import {
	DEFAULT_CONNECT_DISTANCE,
	DEFAULT_DOT_COUNT,
	DEFAULT_DRIFT_SPEED,
	DEFAULT_LINE_WIDTH,
	DEFAULT_MAX_DOT_SIZE,
	DEFAULT_MIN_DOT_SIZE,
} from '../constants';
import { computeAdaptiveProps } from '../utils/adaptive';

type Props = {
	dotCount?: number;
	minDotSize?: number;
	maxDotSize?: number;
	connectRadius?: number;
	connectDistance?: number;
	driftSpeed?: number;
	lineWidth?: number;
	adaptive: boolean;
};

export type Resolved = {
	dotCount: number;
	minSize: number;
	maxSize: number;
	driftSpeed: number;
	connectDistance: number;
	lineWidth: number;
	pointerRadius: number;
};

function clampInt(v: unknown, fallback: number, min = 1) {
	if (typeof v !== 'number' || Number.isNaN(v)) return fallback;

	return Math.max(min, Math.floor(v));
}

function numberOr(v: unknown, fallback: number) {
	if (typeof v !== 'number' || Number.isNaN(v)) return fallback;

	return v;
}

export function useResolvedSpiderSettings(props: Props) {
	const {
		dotCount,
		minDotSize,
		maxDotSize,
		connectRadius,
		connectDistance,
		driftSpeed,
		lineWidth,
		adaptive,
	} = props;

	const resolvedRef = useRef<Resolved | null>(null);

	const computeResolved = useCallback(
		(width: number, height: number): Resolved => {
			const dpr = window.devicePixelRatio || 1;
			const adaptiveNow = adaptive ? computeAdaptiveProps(width, height, dpr) : null;

			const resolvedDotCount =
				typeof dotCount === 'number'
					? clampInt(dotCount, DEFAULT_DOT_COUNT, 1)
					: (adaptiveNow?.dotCount ?? DEFAULT_DOT_COUNT);

			const resolvedMinSize =
				typeof minDotSize === 'number'
					? numberOr(minDotSize, DEFAULT_MIN_DOT_SIZE)
					: (adaptiveNow?.minSize ?? DEFAULT_MIN_DOT_SIZE);

			const resolvedMaxSize =
				typeof maxDotSize === 'number'
					? numberOr(maxDotSize, DEFAULT_MAX_DOT_SIZE)
					: (adaptiveNow?.maxSize ?? DEFAULT_MAX_DOT_SIZE);

			const resolvedDrift =
				typeof driftSpeed === 'number'
					? numberOr(driftSpeed, DEFAULT_DRIFT_SPEED)
					: (adaptiveNow?.driftSpeed ?? DEFAULT_DRIFT_SPEED);

			const resolvedConnectDistance =
				typeof connectDistance === 'number'
					? numberOr(connectDistance, DEFAULT_CONNECT_DISTANCE)
					: (adaptiveNow?.connectDistance ?? DEFAULT_CONNECT_DISTANCE);

			const resolvedLineWidth =
				typeof lineWidth === 'number'
					? numberOr(lineWidth, DEFAULT_LINE_WIDTH)
					: (adaptiveNow?.lineWidth ?? DEFAULT_LINE_WIDTH);

			const resolvedPointerRadius =
				typeof connectRadius === 'number'
					? connectRadius
					: (adaptiveNow?.pointerRadius ?? adaptiveNow?.connectRadius ?? resolvedConnectDistance);

			return {
				dotCount: resolvedDotCount,
				minSize: resolvedMinSize,
				maxSize: resolvedMaxSize,
				driftSpeed: resolvedDrift,
				connectDistance: resolvedConnectDistance,
				lineWidth: resolvedLineWidth,
				pointerRadius: resolvedPointerRadius,
			};
		},
		[
			adaptive,
			connectDistance,
			connectRadius,
			dotCount,
			driftSpeed,
			lineWidth,
			maxDotSize,
			minDotSize,
		]
	);

	return { resolvedRef, computeResolved };
}
