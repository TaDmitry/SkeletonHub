import { useTranslations } from 'next-intl';

import { ContactForm } from '@/features/contactForm';
import { Text, Title } from '@/shared/ui/index';

import styles from './page.module.scss';

export default function ContactPage() {
	const t = useTranslations('pages.contact.ContactPage');

	return (
		<section className={styles.page}>
			<header className={styles.header}>
				<Title
					align='Left'
					className={styles.title}
				>
					{t('title')}
				</Title>
				<Text
					align='Left'
					className={styles.description}
				>
					{t('description')}
				</Text>
			</header>

			<ContactForm />
		</section>
	);
}
