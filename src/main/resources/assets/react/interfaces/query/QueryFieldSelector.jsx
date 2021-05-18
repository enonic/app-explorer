import getIn from 'get-value';

import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {setValue} from 'semantic-ui-react-form/actions';


export function QueryFieldSelector(props) {
	//console.debug('QueryFieldSelector props', props);

	const [context, dispatch] = getEnonicContext();
	//console.debug('QueryFieldSelector context', context);

	const {
		disabled = false,
		fieldOptions,
		parentPath,
		name = 'field',
		path = parentPath ? `${parentPath}.${name}` : name,
		placeholder = 'Please select a field',
		value = getIn(context.values, path)
	} = props;
	//console.debug('QueryFieldSelector path', path, 'value', value);

	return <SemanticUiReactDropdown
		disabled={disabled}
		onChange={(ignoredEvent,{value: field}) => {
			const newValue = {
				field,
				values: []
			};
			//console.debug('QueryFieldSelector newValue', newValue);
			dispatch(setValue({
				path: parentPath,
				value: newValue
			}));
		}}
		options={fieldOptions}
		placeholder={placeholder}
		value={value}
	/>;
} // function QueryFieldSelector
