import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	text: string;
	href?: string;
	icon?: ReactNode;
	iconPosition?: 'left' | 'right';
	className?: string;
}

export const Button = ({
	text,
	href,
	icon,
	iconPosition = 'left',
	className,
	disabled,
	...restProps
}: ButtonProps) => {
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
	const LabelNode = <span className={styles.label}>{text}</span>;

	if (href && !disabled) {
		return (
			<Link
				href={href}
				className={classes}
				aria-disabled={false}
			>
				{iconPosition === 'left' ? (
					<>
						{IconNode}
						{LabelNode}
					</>
				) : (
					<>
						{LabelNode}
						{IconNode}
					</>
				)}
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
			{iconPosition === 'left' ? (
				<>
					{IconNode}
					{LabelNode}
				</>
			) : (
				<>
					{LabelNode}
					{IconNode}
				</>
			)}
		</button>
	);
};

export default Button;
