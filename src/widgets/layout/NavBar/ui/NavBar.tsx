import { Text, Title } from '@ui';

import styles from './NavBar.module.scss';

export const NavBarWidget = () => {
	return (
		<nav className={styles.navbar}>
			<Title className={styles.title}>SkeletonUI</Title>

			<ul className={styles.navList}>
				<li className={styles.navItem}>
					<Text className={styles.navLink}>Главная</Text>
				</li>

				<li className={styles.navItem}>
					<Text className={styles.navLink}>Документация</Text>
				</li>
			</ul>
		</nav>
	);
};
