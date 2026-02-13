import styles from './loading.module.scss';

export default function Loading() {
	return (
		<div className={styles.loader}>
			<div className={styles.content}>
				<div className={styles.spinner} />
			</div>
		</div>
	);
}
