import {Button, Icon} from 'semantic-ui-react';


export const ButtonDelete = ({
	content = '',
	children = content
		? <><Icon color='red' name='trash alternate outline'/>&nbsp;{content}</>
		: <Icon color='red' name='trash alternate outline'/>,
	icon = true,
	onClick = () => {},
	...rest
}) => <Button
	{...rest}
	icon={icon}
	onClick={onClick}
>{children}</Button>;
