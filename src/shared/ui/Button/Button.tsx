import React, { forwardRef } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './Button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	text?: string;
	href?: string;
	icon?: React.ReactNode;
	iconPosition?: 'left' | 'right';
	className?: string;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
	({ text, href, icon, iconPosition = 'left', className, disabled, ...restProps }, ref) => {
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
			const {
				target,
				rel,
				title,
				id,
				role,
				tabIndex,
				onClick,
				'aria-label': ariaLabel,
				...rest
			} = restProps as React.AnchorHTMLAttributes<HTMLAnchorElement>;

			return (
				<Link href={href}>
					<a
						ref={ref as React.Ref<HTMLAnchorElement>}
						className={classes}
						href={href}
						target={target}
						rel={rel}
						title={title}
						id={id}
						role={role}
						tabIndex={tabIndex}
						onClick={onClick}
						aria-label={ariaLabel}
						aria-disabled={false}
						{...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
					>
						{content}
					</a>
				</Link>
			);
		}

		const buttonProps = restProps as React.ButtonHTMLAttributes<HTMLButtonElement>;

		return (
			<button
				ref={ref as React.Ref<HTMLButtonElement>}
				{...buttonProps}
				type={buttonProps.type ?? 'button'}
				className={classes}
				disabled={disabled}
			>
				{content}
			</button>
		);
	}
);

Button.displayName = 'Button';
export default Button;
