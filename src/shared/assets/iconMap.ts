import { FC, SVGProps } from 'react';

interface RequireContext {
	keys(): string[];
	(id: string): { default: FC<SVGProps<SVGSVGElement>> } | FC<SVGProps<SVGSVGElement>>;
}

declare const require: {
	context(path: string, useSubdirectories: boolean, regExp: RegExp): RequireContext;
};

const req: RequireContext = require.context('./svgs', false, /\.svg$/);
const toPascal = (s: string) =>
	s
		.replace(/(^\.|\.svg$)/g, '')
		.replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase())
		.replace(/^(\w)/, (_, c) => c.toUpperCase());
type DefaultSvgProps = SVGProps<SVGSVGElement>;

const icons: Record<string, FC<DefaultSvgProps>> = {};

req.keys().forEach((file) => {
	const iconModule = req(file);
	const Component =
		(iconModule as { default?: FC<DefaultSvgProps> }).default ||
		(iconModule as FC<DefaultSvgProps>);
	const name = toPascal(file.replace('./', '').replace('.svg', ''));
	icons[name] = Component;
});

export type IconName = keyof typeof icons;
export const iconMap = icons as Record<IconName, FC<DefaultSvgProps>>;
export type { DefaultSvgProps };
