import { useTranslations } from 'next-intl';

import { Text } from '@/shared/ui/index';

import styles from './Footer.module.scss';

export const FooterWidget = () => {
	const t = useTranslations('layout.footer.Footer');
	const currentYear = new Date().getFullYear();

	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<Text
					align='Center'
					as='span'
					className={styles.copyright}
				>
					{t('copyright', { year: currentYear })}
				</Text>
			</div>
		</footer>
	);
};
