import {Input} from './Input';


export const TextInput = ({
	type = 'text',
	...rest
}) => <Input type={type} {...rest}/>;
