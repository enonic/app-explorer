import type {SemanticUi} from '../../../types/SemanticUi.d';


import getIn from 'get-value';
import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';

//@ts-ignore
import {getEnonicContext} from 'semantic-ui-react-form/Context';
//@ts-ignore
import {setValue} from 'semantic-ui-react-form/actions';


export function CollectorSelector(props :{
	name ?:string
	options ?:SemanticUi.Dropdown.Options
	parentPath ?:string
	path ?:string
	placeholder ?:string
	value ?:string
}) {
	//console.debug('CollectorSelector props', props);

	const [context, dispatch] = getEnonicContext();
	//console.debug('CollectorSelector context', context);

	const {
		name = 'name',
		options = [],
		parentPath = 'collector',
		path = parentPath ? `${parentPath}.${name}` : name,
		placeholder = 'none',
		value = getIn(context.values, path),
		...rest
	} = props;
	//console.debug('CollectorSelector path', path, 'value', value, 'rest', rest);

	const optionsWithANoneOption :SemanticUi.Dropdown.Options = [{
		key: 'none',
		text: 'none'
	}].concat(options);

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
