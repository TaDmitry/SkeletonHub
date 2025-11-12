import React from 'react';
import clsx from 'clsx';

import { DEFAULT_DOT_COLOR } from './constants';
import { useSpiderCanvas } from './hooks/useSpiderCanvas';

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
	adaptive?: boolean;
	pointerLineColor?: string;
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
	maxConnections,
	disableOnTouch = false,
	driftSpeed,
	lineWidth,
	adaptive = true,
	pointerLineColor,
	...rest
}: SpiderCanvasProps) {
	const { containerRef, bgCanvasRef, fgCanvasRef } = useSpiderCanvas({
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
	});

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
