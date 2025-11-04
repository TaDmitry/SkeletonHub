import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	text: string;
	href?: string;
	icon?: ReactNode;
	className?: string;
}

export const Button = ({ text, href, icon, className, disabled, ...restProps }: ButtonProps) => {
	const classes = clsx(styles.button, className, disabled && styles.disabled);

	if (href && !disabled) {
		return (
			<Link
				href={href}
				className={classes}
				aria-disabled={false}
			>
				{icon && <span className={styles.icon}>{icon}</span>}
				<span className={styles.label}>{text}</span>
			</Link>
		);
	}

	return (
		<button
			{...restProps}
			type={restProps.type ?? 'button'}
			className={classes}
			disabled={disabled}
		>
			{icon && <span className={styles.icon}>{icon}</span>}
			<span className={styles.label}>{text}</span>
		</button>
	);
};

export default Button;
