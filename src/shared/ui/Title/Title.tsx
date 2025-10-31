import React, { ElementType, JSX } from 'react';
import clsx from 'clsx';

import styles from './Title.module.scss';

export interface TitleProps {
	children: React.ReactNode;
	tag?: keyof JSX.IntrinsicElements;
	align?: 'left' | 'center' | 'right';
	className?: string;
}

export const Title = ({ tag = 'h1', align = 'center', children, className }: TitleProps) => {
	const Tag = tag as ElementType;

	return <Tag className={clsx(styles[`align_${align}`], className)}>{children}</Tag>;
};
