import React, { forwardRef } from 'react';
import clsx from 'clsx';

import { iconMap, type IconName } from '@/shared/assets/iconMap';

import styles from './Icon.module.scss';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
	icon: IconName | React.FC<never>;
	size?: string | number;
	title?: string;
	decorative?: boolean;
	color?: string;
}

const DEFAULT_ICON_SIZE = 24;

const IconInner = (
	{
		size = DEFAULT_ICON_SIZE,
		icon,
		className,
		title,
		decorative = false,
		color,
		...restProps
	}: IconProps,
	ref: React.ForwardedRef<SVGSVGElement>
) => {
	const SvgComponent = typeof icon === 'string' ? iconMap[icon] : (icon as React.FC<unknown>);
	if (!SvgComponent) return null;

	const accessibility = decorative
		? { 'aria-hidden': true }
		: title
			? { 'role': 'img', 'aria-label': title }
			: { role: 'img' };

	const styleProp = color ? { color } : undefined;

	const svgProps: React.SVGProps<SVGSVGElement> = {
		width: size,
		height: size,
		className: clsx(styles.svgIcon, className),
		...accessibility,
		...restProps,
	};

	return (
		<SvgComponent
			ref={ref as never}
			{...svgProps}
			style={styleProp}
		/>
	);
};

export const Icon = forwardRef(IconInner);
