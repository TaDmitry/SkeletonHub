import React from 'react';
import clsx from 'clsx';

import { ContactForm } from '@/features/contactForm';

import styles from './ContactFormWidget.module.scss';

type ContactFormWidgetProps = {
	className?: string;
};

export const ContactFormWidget: React.FC<ContactFormWidgetProps> = ({ className }) => {
	return <ContactForm className={clsx(styles.root, className)} />;
};
