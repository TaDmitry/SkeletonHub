const FALLBACK_FIELD_VALUE = '-';
const MILLISECONDS_IN_SECOND = 1000;
const DOWNLINK_SPEED_DECIMAL_PLACES = 2;
const SUBMISSION_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
	dateStyle: 'medium',
	timeStyle: 'medium',
});

export function formatSubmissionDate(date: Date) {
	return SUBMISSION_DATE_FORMATTER.format(date);
}

export function formatFillSpeed(fillSpeedMs?: number) {
	if (typeof fillSpeedMs !== 'number' || !Number.isFinite(fillSpeedMs) || fillSpeedMs < 0) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${(fillSpeedMs / MILLISECONDS_IN_SECOND).toFixed(1)} sec`;
}

export function formatNetworkLatency(networkLatencyMs?: number) {
	if (
		typeof networkLatencyMs !== 'number' ||
		!Number.isFinite(networkLatencyMs) ||
		networkLatencyMs < 0
	) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${networkLatencyMs.toFixed(0)} ms`;
}

export function formatDeviceMemory(deviceMemoryGb?: number) {
	if (
		typeof deviceMemoryGb !== 'number' ||
		!Number.isFinite(deviceMemoryGb) ||
		deviceMemoryGb <= 0
	) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${deviceMemoryGb.toFixed(1)} GB`;
}

export function formatCpuCores(cpuCores?: number) {
	if (typeof cpuCores !== 'number' || !Number.isFinite(cpuCores) || cpuCores <= 0) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${cpuCores.toFixed(0)} cores`;
}

export function formatDownlinkSpeed(downlinkSpeed?: number) {
	if (typeof downlinkSpeed !== 'number' || !Number.isFinite(downlinkSpeed) || downlinkSpeed < 0) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${downlinkSpeed.toFixed(DOWNLINK_SPEED_DECIMAL_PLACES)} Mbps`;
}

export function formatTouchSupport(touchSupport?: boolean) {
	if (typeof touchSupport !== 'boolean') {
		return FALLBACK_FIELD_VALUE;
	}

	return touchSupport ? 'Yes' : 'No';
}

export function formatColorScheme(colorScheme?: 'light' | 'dark') {
	if (!colorScheme || (colorScheme !== 'light' && colorScheme !== 'dark')) {
		return FALLBACK_FIELD_VALUE;
	}

	return colorScheme === 'dark' ? 'Dark' : 'Light';
}

export function formatPageLoadTime(pageLoadTime?: number) {
	if (typeof pageLoadTime !== 'number' || !Number.isFinite(pageLoadTime) || pageLoadTime < 0) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${pageLoadTime.toFixed(0)} ms`;
}

export function normalizeMetadataValue(value?: string) {
	if (!value) {
		return FALLBACK_FIELD_VALUE;
	}

	const trimmedValue = value.trim();

	return trimmedValue.length > 0 ? trimmedValue : FALLBACK_FIELD_VALUE;
}
