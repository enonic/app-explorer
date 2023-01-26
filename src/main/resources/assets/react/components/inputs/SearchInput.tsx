import type {
	StrictInputProps,
} from 'semantic-ui-react';


import React from 'react';
import {
	Icon,
	Input,
} from 'semantic-ui-react';


function SearchInput({
	borderRadius = 19,
	onKeyUp = () => undefined,
	...rest
}: Omit<StrictInputProps, 'icon'> & {
	borderRadius?: number
	onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void
	value: string
}) {
	return <Input
		icon
		onKeyUp={onKeyUp}
		{...rest}
	>
		<input style={{
			borderRadius
		}}/>
		<Icon name='search'/>
	</Input>
}

export default SearchInput;
