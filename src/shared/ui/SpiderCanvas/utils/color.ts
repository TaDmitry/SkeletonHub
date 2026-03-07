/* eslint-disable no-magic-numbers */
export function hexToRgba(hex: string, alpha = 1) {
	if (!hex) return `rgb(0 0 0 / ${alpha})`;
	const normalized = hex.trim();

	const rgbMatch = normalized.match(
		/^rgb\(\s*(\d{1,3})(?:\s+|,\s*)(\d{1,3})(?:\s+|,\s*)(\d{1,3})/i
	);
	if (rgbMatch) {
		const r = Number(rgbMatch[1]);
		const g = Number(rgbMatch[2]);
		const b = Number(rgbMatch[3]);

		return `rgb(${r} ${g} ${b} / ${alpha})`;
	}

	const h = normalized.replace('#', '');
	if (h.length === 3) {
		const r = parseInt(h[0] + h[0], 16);
		const g = parseInt(h[1] + h[1], 16);
		const b = parseInt(h[2] + h[2], 16);

		return `rgb(${r} ${g} ${b} / ${alpha})`;
	}
	if (h.length === 6) {
		const r = parseInt(h.slice(0, 2), 16);
		const g = parseInt(h.slice(2, 4), 16);
		const b = parseInt(h.slice(4, 6), 16);

		return `rgb(${r} ${g} ${b} / ${alpha})`;
	}

	return `rgb(0 0 0 / ${alpha})`;
}
