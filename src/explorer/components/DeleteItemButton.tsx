import type {StrictButtonProps} from 'semantic-ui-react';


import {
	Button,
	Icon
} from 'semantic-ui-react';


export function DeleteItemButton<ArrayItemType>({
	// Required
	array,
	setArrayFunction,
	// Optional
	children = <Icon color='red' name='trash alternate outline'/>,
	disabled = array.length < 2,
	index = 0,
	...rest // loading, etc...
} :Omit<
	StrictButtonProps,'onClick'|'type'
> & {
	// Required
	array: ArrayItemType[]
	setArrayFunction: (array: ArrayItemType[]) => void
	// Optional
	index?: number
}) {
	return <Button
		{...rest}
		disabled={disabled}
		icon
		onClick={() => {
			const deref = JSON.parse(JSON.stringify(array));
			deref.splice(index, 1);
			setArrayFunction(deref);
		}}
		type='button'
	>{children}</Button>;
}
