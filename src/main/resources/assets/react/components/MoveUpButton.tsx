import type {StrictButtonProps} from 'semantic-ui-react';


import {
	Button,
	Icon
} from 'semantic-ui-react';


export function MoveUpButton<ArrayItemType>({
	// Required
	array,
	setArrayFunction,
	// Optional
	children = <Icon color='blue' name='arrow up'/>,
	icon = true,
	index = 0,
	disabled = index === 0,
	...rest // disabled, loading, etc...
} :Omit<
	StrictButtonProps,'onClick'|'type'
> & {
	// Required
	array :Array<ArrayItemType>
	setArrayFunction :(array :Array<ArrayItemType>) => void
	// Optional
	index ?:number
}) {
	return <Button
		{...rest}
		disabled={disabled}
		icon={icon}
		onClick={() => {
			const deref = JSON.parse(JSON.stringify(array));
			const tmp = deref[index];
			deref[index] = deref[index - 1];
			deref[index - 1] = tmp;
			setArrayFunction(deref);
		}}
		type='button'
	>{children}</Button>;
}
