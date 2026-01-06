import React, { ElementType, forwardRef } from 'react';
import clsx from 'clsx';

import styles from './Text.module.scss';

export type TextTag = 'p' | 'span' | 'div';

export interface TextProps {
	children?: React.ReactNode;
	as?: TextTag;
	className?: string;
	align?: 'left' | 'center' | 'right';
	noWrap?: boolean;
	truncate?: boolean;
	id?: string;
}

export const Text = forwardRef<HTMLElement, TextProps>(
	(
		{ as = 'p', children, className, align = 'left', noWrap = false, truncate = false, id },
		ref
	) => {
		const Tag: ElementType = as;

		return (
			<Tag
				ref={ref as never}
				id={id}
				className={clsx(
					styles[`align_${align}`],
					className,
					noWrap && styles.noWrap,
					truncate && styles.truncate
				)}
			>
				{children}
			</Tag>
		);
	}
);

Text.displayName = 'Text';
