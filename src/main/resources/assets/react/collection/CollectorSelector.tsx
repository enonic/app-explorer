import type {
	DropdownItemProps,
	StrictDropdownProps
} from 'semantic-ui-react';


import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';


export function CollectorSelector({
	collectorName,
	setCollectorName,
	options = [],
	placeholder = 'none',
	...rest
} :Omit<StrictDropdownProps,'onChange'|'options'|'value'> & {
	collectorName :string
	setCollectorName :(collectorName :string) => void
	options ?:Array<DropdownItemProps>
}) {
	const optionsWithANoneOption :Array<DropdownItemProps> = [{
		key: 'none',
		text: 'none'
	} as DropdownItemProps].concat(options);

	return <SemanticUiReactDropdown
		clearable={true}
		fluid
		selection
		{...rest}
		onChange={(
			_event,
			{value: newCollectorName}
		) => {
			setCollectorName(newCollectorName as string);
		}}
		options={optionsWithANoneOption}
		placeholder={placeholder}
		value={collectorName}
	/>;
} // function CollectorSelector
