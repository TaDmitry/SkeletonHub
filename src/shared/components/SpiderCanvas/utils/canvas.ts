// src/shared/components/SpiderCanvas/utils/canvas.ts
import { COORD_ROUND_FACTOR, MIN_DPR } from '../constants';

export function setCanvasSize(canvas: HTMLCanvasElement, width: number, height: number) {
	const dpr = Math.max(MIN_DPR, window.devicePixelRatio || 1);
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
	canvas.width = Math.max(1, Math.floor(width * dpr));
	canvas.height = Math.max(1, Math.floor(height * dpr));
	const ctx = canvas.getContext('2d');
	if (ctx) {
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.imageSmoothingEnabled = true;
	}
}

export function roundCoord(v: number) {
	return Math.round(v * COORD_ROUND_FACTOR) / COORD_ROUND_FACTOR;
}
