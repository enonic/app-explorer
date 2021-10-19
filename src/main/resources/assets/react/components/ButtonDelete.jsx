import {Button, Icon} from 'semantic-ui-react';


export const ButtonDelete = ({
	children = <Icon color='red' name='trash alternate outline'/>,
	icon = true,
	onClick = () => {},
	...rest
}) => <Button
	{...rest}
	icon={icon}
	onClick={onClick}
>{children}</Button>;
