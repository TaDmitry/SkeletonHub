import { FC, SVGProps } from 'react';

import * as Icons from './index';

export type DefaultSvgProps = SVGProps<SVGElement>;

export type IconName = keyof typeof Icons;

export const iconMap: Record<IconName, FC<DefaultSvgProps>> = Icons as unknown as Record<
	IconName,
	FC<DefaultSvgProps>
>;
