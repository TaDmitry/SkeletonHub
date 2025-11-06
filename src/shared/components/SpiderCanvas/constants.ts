// src/shared/components/SpiderCanvas/constants.ts
export const DEFAULT_DOT_COUNT = 50;
export const DEFAULT_MIN_DOT_SIZE = 5;
export const DEFAULT_MAX_DOT_SIZE = 8;
export const DEFAULT_CONNECT_RADIUS = 300;
export const DEFAULT_DRIFT_SPEED = 10;
export const DEFAULT_LINE_WIDTH = 1;
export const DEFAULT_DOT_COLOR = '#000000';
export const COORD_ROUND_FACTOR = 100;
export const TWO_PI = Math.PI + Math.PI;
export const DRIFT_RANDOM_BASE = 0.2;
export const DRIFT_RANDOM_RANGE = 0.6;
export const MS_IN_SECOND = 1000;
export const MIN_DPR = 1;

// connection defaults
export const DEFAULT_CONNECT_DISTANCE = 120;
export const DEFAULT_MAX_CONNECTIONS = 3;
export const CONNECTION_MIN_ALPHA = 0.05;
export const CONNECTION_ALPHA_FACTOR = 0.6;

// adaptive sizing defaults
export const ADAPTIVE_BASE_WIDTH = 1366;
export const ADAPTIVE_BASE_HEIGHT = 768;
export const ADAPTIVE_BASE_AREA = ADAPTIVE_BASE_WIDTH * ADAPTIVE_BASE_HEIGHT;
export const ADAPTIVE_MIN_DOTS = 8;
export const ADAPTIVE_MAX_DOTS = 800;
export const ADAPTIVE_MIN_SIZE = 3;
export const ADAPTIVE_MAX_SIZE = 14;
export const ADAPTIVE_MIN_DRIFT = 4;
export const ADAPTIVE_MAX_DRIFT = 30;
