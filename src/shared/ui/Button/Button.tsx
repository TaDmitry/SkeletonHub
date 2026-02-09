import React, { forwardRef } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './Button.module.scss';

type IconPosition = 'left' | 'right';

interface CommonProps {
	'text'?: string;
	'icon'?: React.ReactNode;
	'iconPosition'?: IconPosition;
	'className'?: string;
	'disabled'?: boolean;
	'title'?: string;
	'id'?: string;
	'aria-label'?: string;
	'onClick'?: React.MouseEventHandler<HTMLElement>;
}

interface AnchorProps extends CommonProps {
	href: string;
}

interface ButtonOnlyProps extends CommonProps {
	href?: undefined;
}

type ButtonProps = AnchorProps | ButtonOnlyProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
	({ text, icon, iconPosition = 'left', className, disabled = false, href, ...rest }, ref) => {
		const classes = clsx(
			styles.button,
			className,
			disabled && styles.disabled,
			icon && styles.hasIcon,
			iconPosition === 'right' && styles.iconRight
		);

		const IconNode = icon ? (
			<span
				className={styles.icon}
				aria-hidden='true'
			>
				{icon}
			</span>
		) : null;
		const LabelNode = text ? <span className={styles.label}>{text}</span> : null;

		const content =
			iconPosition === 'left' ? (
				<>
					{IconNode}
					{LabelNode}
				</>
			) : (
				<>
					{LabelNode}
					{IconNode}
				</>
			);

		if (href && !disabled) {
			const isExternal = /^https?:\/\//.test(href);

			if (isExternal) {
				return (
					<a
						ref={ref as React.Ref<HTMLAnchorElement>}
						className={classes}
						href={href}
						target='_blank'
						rel='noopener noreferrer'
						{...rest}
					>
						{content}
					</a>
				);
			}

			return (
				<Link
					href={href}
					className={classes}
					ref={ref as React.Ref<HTMLAnchorElement>}
					{...rest}
				>
					{content}
				</Link>
			);
		}

		return (
			<button
				ref={ref as React.Ref<HTMLButtonElement>}
				type='button'
				className={classes}
				disabled={disabled}
				{...rest}
			>
				{content}
			</button>
		);
	}
);

Button.displayName = 'Button';
export default Button;
