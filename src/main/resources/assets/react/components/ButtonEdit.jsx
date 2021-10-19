import {Button, Icon} from 'semantic-ui-react';


export const ButtonEdit = ({
	children = <Icon color='blue' name='edit'/>,
	icon = true,
	onClick = () => {},
	...rest
}) => <Button
	{...rest}
	icon={icon}
	onClick={onClick}
>
	{children}
</Button>;
