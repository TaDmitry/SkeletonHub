import { FC, SVGProps } from 'react';

const req = (require as any).context('./svgs', false, /\.svg$/);

const toPascal = (s: string) =>
	s
		.replace(/(^\.|\.svg$)/g, '')
		.replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase())
		.replace(/^(\w)/, (_, c) => c.toUpperCase());

type DefaultSvgProps = SVGProps<SVGSVGElement>;

const icons: Record<string, FC<DefaultSvgProps>> = {};

req.keys().forEach((file: string) => {
	const iconModule = req(file);
	const Component = iconModule.default || iconModule;
	const name = toPascal(file.replace('./', '').replace('.svg', ''));
	icons[name] = Component;
});

export type IconName = keyof typeof icons;
export const iconMap = icons as Record<IconName, FC<DefaultSvgProps>>;
export type { DefaultSvgProps };
