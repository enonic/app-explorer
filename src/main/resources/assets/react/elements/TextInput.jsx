import {Input} from './Input';


export const TextInput = ({
	type, // So it doesn't end up in rest
	...rest
}) => <Input type='text' {...rest}/>;
