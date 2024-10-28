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
	onSubmit = () => () => {},
	...rest
}: Omit<StrictInputProps, 'icon'> & {
	borderRadius?: number
	onSubmit?: () => void
	value: string
}) {
	return <Input
		icon
		onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key == 'Enter' || event.key == 'Return') {
				onSubmit();
			}
		}}
		{...rest}
	>
		<input style={{
			borderRadius
		}}/>
		<Icon link name='search' onClick={() => {
			onSubmit();
		}}/>
	</Input>
}

export default SearchInput;
