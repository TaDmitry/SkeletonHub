'use client';
import { useState } from 'react';

import { Modal, Notification, Title } from '@ui/index';

export const HistoricalDates = () => {
	const [showModal, setShowModal] = useState(false);
	const [showNotification, setShowNotification] = useState(false);

	return (
		<div>
			<div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
				<button onClick={() => setShowModal(true)}>Открыть модалку</button>
				<button onClick={() => setShowNotification(true)}>Показать уведомление</button>
			</div>

			{/* Модалка */}
			{showModal && (
				<Modal
					setIsModalOpened={setShowModal}
					withBackground
				>
					<Title
						tag='H2'
						className='title'
						text='Модалка'
						align='left'
					/>
				</Modal>
			)}

			{/* Уведомление */}
			{showNotification && (
				<Notification
					text='Сохранено!'
					onClose={() => setShowNotification(false)}
				/>
			)}
		</div>
	);
};
