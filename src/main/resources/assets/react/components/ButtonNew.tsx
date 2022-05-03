import {Button, Icon} from 'semantic-ui-react';


export const ButtonNew = ({
	children = <Icon name='plus'/>,
	circular = true,
	color = 'green',
	icon = true,
	onClick = () => {},
	size = 'massive',
	style = {
		bottom: 13.5,
		// An element with position: fixed; is positioned relative to the viewport,
		// which means it always stays in the same place even if the page is scrolled.
		// The top, right, bottom, and left properties are used to position the element.
		position: 'fixed',
		right: 13.5
	},
	...rest
}) => <Button
	{...rest}
	circular={circular}
	color={color}
	icon={icon}
	onClick={onClick}
	size={size}
	style={style}
>{children}</Button>;
