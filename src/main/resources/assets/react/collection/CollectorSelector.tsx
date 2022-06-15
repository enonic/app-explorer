import type {StrictDropdownProps} from 'semantic-ui-react';
import {DropdownItemsWithKeys} from './index.d';


import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';


export function CollectorSelector({
	collectorName,
	setCollectorName,
	options = [],
	placeholder = 'Please select if you want to use a collector',
	...rest
} :Omit<StrictDropdownProps,'onChange'|'options'|'value'> & {
	collectorName :string
	setCollectorName :(collectorName :string) => void
	options ?:DropdownItemsWithKeys<string>
}) {
	const optionsWithANoneOption :DropdownItemsWithKeys<string> = ([{
		key: '_none',
		text: 'none',
		value: '_none'
	}] as DropdownItemsWithKeys<string>).concat(options);
	//console.debug('CollectorSelector optionsWithANoneOption', optionsWithANoneOption);

	return <SemanticUiReactDropdown
		clearable={true}
		fluid
		selection
		{...rest}
		onChange={(
			_event,
			{ value: newCollectorName } :{ value :string }
		) => {
			//console.debug('CollectorSelector onChange newCollectorName:', newCollectorName);
			setCollectorName(newCollectorName);
		}}
		options={optionsWithANoneOption}
		placeholder={placeholder}
		value={collectorName}
	/>;
} // function CollectorSelector
