import React, { forwardRef } from 'react';
import clsx from 'clsx';

import { type DefaultSvgProps, iconMap, type IconName } from '@shared/assets/iconMap';

import styles from './Icon.module.scss';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
	icon: IconName | React.FC<any>;
	size?: string | number;
	view?: string | number;
	svgProps?: DefaultSvgProps;
	title?: string;
	decorative?: boolean;
	color?: string;
}

const DEFAULT_ICON_SIZE = 24;
const DEFAULT_ICON_VIEWBOX = 24;

const IconInner = (
	{
		size = DEFAULT_ICON_SIZE,
		view = DEFAULT_ICON_VIEWBOX,
		icon,
		className,
		svgProps,
		title,
		decorative = false,
		color,
		...restProps
	}: IconProps,
	ref: React.ForwardedRef<SVGSVGElement>
) => {
	const SvgContent = typeof icon === 'string' ? iconMap[icon] : (icon as React.FC<any>);
	if (!SvgContent) return null;

	const effectiveSvgProps = { ...(svgProps || {}) } as any;
	if (color) {
		if (effectiveSvgProps.stroke === undefined) effectiveSvgProps.stroke = color;
		if (effectiveSvgProps.fill === undefined) effectiveSvgProps.fill = color;
	}

	const accessibility = decorative
		? { 'aria-hidden': true }
		: title
			? { 'role': 'img', 'aria-label': title }
			: { role: 'img' };

	const viewBox = typeof view === 'string' ? view : `0 0 ${view} ${view}`;

	return (
		<svg
			ref={ref}
			fill='none'
			width={size}
			height={size}
			viewBox={viewBox}
			className={clsx(styles.svgIcon, className)}
			{...accessibility}
			{...restProps}
		>
			{title ? <title>{title}</title> : undefined}
			<SvgContent {...effectiveSvgProps} />
		</svg>
	);
};

export const Icon = forwardRef(IconInner);
