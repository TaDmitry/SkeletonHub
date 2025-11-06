'use client';

import React from 'react';
import { SpiderCanvas } from '@components';

// import styles from './RootLayout.module.scss';

export default function Home() {
	return (
		<header
			className='banner'
			style={{ height: '100%', width: '100%', position: 'relative' }}
		>
			<SpiderCanvas
				connectDots={true}
				disableOnTouch={true}
			/>
		</header>
	);
}
