import { FC, SVGProps } from 'react';

export const CircleDecoration: FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg
		viewBox='0 0 536 530'
		preserveAspectRatio='xMidYMid meet'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		{...props}
	>
		<circle
			opacity='0.2'
			cx='268'
			cy='265'
			r='264.5'
			stroke='#42567A'
		/>
		<circle
			cx='533'
			cy='265'
			r='3'
			fill='#42567A'
		/>
		<circle
			cx='138'
			cy='34'
			r='3'
			fill='#42567A'
		/>
		<circle
			cx='402'
			cy='492'
			r='3'
			fill='#42567A'
		/>
		<circle
			cx='126'
			cy='489'
			r='3'
			fill='#42567A'
		/>
		<circle
			cx='3'
			cy='265'
			r='3'
			fill='#42567A'
		/>
	</svg>
);
