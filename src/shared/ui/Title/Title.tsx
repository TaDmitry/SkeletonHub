import React, { ElementType, forwardRef } from 'react';
import clsx from 'clsx';

import styles from './Title.module.scss';

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface TitleProps {
	children: React.ReactNode;
	tag?: HeadingTag;
	align?: 'left' | 'center' | 'right';
	className?: string;
	id?: string;
	visuallyHidden?: boolean;
}

export const Title = forwardRef<HTMLElement, TitleProps>(
	({ tag = 'h1', align = 'center', children, className, id, visuallyHidden = false }, ref) => {
		const Tag: ElementType = tag;

		return (
			<Tag
				ref={ref as any}
				id={id}
				className={clsx(
					styles.root,
					styles[`align_${align}`],
					className,
					visuallyHidden && styles.visuallyHidden
				)}
			>
				{children}
			</Tag>
		);
	}
);

Title.displayName = 'Title';
