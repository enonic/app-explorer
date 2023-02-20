import {
	type SemanticCOLORS,
	type SemanticICONS,
	type StrictButtonProps,
	Button,
	Icon,
} from 'semantic-ui-react';


export default function HoverButton({
	basic, // eslint-disable-line
	children,
	color,
	content, // eslint-disable-line
	icon,
	loading,
	...rest
}: Omit<StrictButtonProps, 'basic'|'color'|'content'|'icon'> & {
	basic?: never
	color?: SemanticCOLORS
	content?: never
	icon?: SemanticICONS
}) {
	return <Button
		basic
		className='marginless translucent'
		icon={!!icon}
		{...rest}
	>
		{
			children
				? children
				: icon
					? <Icon
						color={color}
						loading={loading}
						name={icon}
					/>
					: null
		}
	</Button>;
}
