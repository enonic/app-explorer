import {Input} from './Input';


export const NumberInput = ({
	type, // So it doesn't end up in rest
	...rest
}) => <Input type='number' {...rest}/>;
