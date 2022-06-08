import type {StrictButtonProps} from 'semantic-ui-react';


import {
	Button,
	Icon
} from 'semantic-ui-react';


export function InsertButton<ArrayItemType>({
	// Required
	array,
	setArrayFunction,
	valueToInsert,
	// Optional
	children = <Icon color='green' name='add'/>,
	icon = true,
	insertAtIndex = 0,
	...rest // disabled, loading, etc...
} :Omit<
	StrictButtonProps,'onClick'|'type'|'value'
> & {
	// Required
	array :Array<ArrayItemType>
	setArrayFunction :(array :Array<ArrayItemType>) => void
	valueToInsert :ArrayItemType
	// Optional
	insertAtIndex ?:number
}) {
	return <Button
		{...rest}
		icon={icon}
		onClick={() => {
			const deref = JSON.parse(JSON.stringify(array));
			deref.splice(insertAtIndex, 0, valueToInsert);
			setArrayFunction(deref);
		}}
		type='button'
	>{children}</Button>;
}
