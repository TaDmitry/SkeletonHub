import { JSX } from 'react';
import clsx from 'clsx';

import styles from './Title.module.scss';

type TitleTagOptions =
	| 'H1'
	| 'H2'
	| 'H3'
	| 'H4'
	| 'P1'
	| 'P2'
	| 'P3'
	| 'P4'
	| 'P5'
	| 'Btn1'
	| 'Filtr'
	| 'Inputs';
export interface TitleProps {
	text: string;
	tag?: TitleTagOptions;
	color?: 'main' | 'second';
	align?: 'left' | 'center' | 'right';
	className?: string;
}

export const Title = ({
	tag = 'H1',
	color = 'main',
	align = 'center',
	text,
	className,
}: TitleProps) => {
	const alignClass = styles[`align_${align}`];

	const tagStyle = {
		H1: {
			tag: 'h1',
			className: 'H1',
		},
		H2: {
			tag: 'h2',
			className: 'H2',
		},
		H3: {
			tag: 'h3',
			className: 'H3',
		},
		H4: {
			tag: 'h4',
			className: 'H4',
		},
		P1: {
			tag: 'p',
			className: 'P1',
		},
		P2: {
			tag: 'p',
			className: 'P2',
		},
		P3: {
			tag: 'p',
			className: 'P3',
		},
		P4: {
			tag: 'p',
			className: 'P4',
		},
		P5: {
			tag: 'p',
			className: 'P5',
		},
		Btn1: {
			tag: 'p',
			className: 'Btn1',
		},
		Filtr: {
			tag: 'p',
			className: 'Filtr',
		},
		Inputs: {
			tag: 'span',
			className: 'Inputs',
		},
	};
	const Tag = tagStyle[tag].tag as keyof JSX.IntrinsicElements;

	return (
		<Tag className={clsx(styles[tagStyle[tag].className], styles[color], alignClass, className)}>
			{text}
		</Tag>
	);
};
