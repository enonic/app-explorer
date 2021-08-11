import getIn from 'get-value';
import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {setValue} from 'semantic-ui-react-form/actions';


export function CollectorSelector(props) {
	//console.debug('CollectorSelector props', props);

	const [context, dispatch] = getEnonicContext();
	//console.debug('CollectorSelector context', context);

	const {
		name = 'name',
		parentPath = 'collector',
		path = parentPath ? `${parentPath}.${name}` : name,
		placeholder = 'none',
		value = getIn(context.values, path),
		...rest
	} = props;
	//console.debug('CollectorSelector path', path, 'value', value, 'rest', rest);

	return <SemanticUiReactDropdown
		{...rest}
		clearable
		fluid
		onChange={(ignoredEvent,{value: newName}) => {
			//console.debug('CollectorSelector newName', newName);
			dispatch(setValue({
				path: parentPath,
				value: {
					name: newName,
					config: null // Always let child form set initial config value!
				}
			}));
		}}
		placeholder={placeholder}
		selection
		value={value}
	/>;
} // function CollectorSelector
