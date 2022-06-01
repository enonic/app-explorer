import type {DropdownItemProps} from 'semantic-ui-react/index.d';


import {getIn} from '@enonic/js-utils';
import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';
import {
	getEnonicContext,
	setValue
} from '@enonic/semantic-ui-react-form';


export function CollectorSelector(props :{
	name ?:string
	options ?:Array<DropdownItemProps>
	parentPath ?:string
	path ?:string
	placeholder ?:string
	value ?:string
}) {
	//console.debug('CollectorSelector props', props);

	const {dispatch, state} = getEnonicContext();
	//console.debug('CollectorSelector context', context);

	const {
		name = 'name',
		options = [],
		parentPath = 'collector',
		path = parentPath ? `${parentPath}.${name}` : name,
		placeholder = 'none',
		value = getIn(state.values, path),
		...rest
	} = props;
	//console.debug('CollectorSelector path', path, 'value', value, 'rest', rest);

	const optionsWithANoneOption :Array<DropdownItemProps> = [{
		key: 'none',
		text: 'none'
	} as DropdownItemProps].concat(options);

	return <SemanticUiReactDropdown
		{...rest}
		clearable={true}
		fluid
		onChange={(
			//@ts-ignore
			ignoredEvent,
			{value: newName}
		) => {
			//console.debug('CollectorSelector newName', newName);
			dispatch(setValue({
				path: parentPath,
				value: {
					name: newName,
					config: null // Always let child form set initial config value!
				}
			}));
		}}
		options={optionsWithANoneOption}
		placeholder={placeholder}
		selection
		value={value}
	/>;
} // function CollectorSelector
