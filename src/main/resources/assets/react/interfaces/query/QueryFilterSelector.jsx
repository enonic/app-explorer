import getIn from 'get-value';
//import {Dropdown} from '../../enonic/Dropdown';
import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';

import {getEnonicContext} from '../../enonic/Context';
import {setValue} from '../../enonic/Form';


const OPTIONS = [{
	key: 'exists',
	text: 'Exists',
	value: 'exists'
},{
	key: 'hasValue',
	text: 'Has value',
	value: 'hasValue'
},{
	key: 'notExists',
	text: 'Not exists',
	value: 'notExists'
},{
	key: 'ids',
	text: 'Ids',
	value: 'ids'
}];


export function QueryFilterSelector(props) {
	//console.debug('QueryFilterSelector props', props);

	const [context, dispatch] = getEnonicContext();
	//console.debug('QueryFilterSelector context', context);

	const {
		parentPath,
		name = 'filter',
		path = parentPath ? `${parentPath}.${name}` : name,
		value = getIn(context.values, path)
	} = props;

	//console.debug('QueryFilterSelector path', path);
	return <SemanticUiReactDropdown
		onChange={(ignoredEvent,{value: filter}) => {
			const newValue = {
				filter,
				params: {
					field: filter === 'ids' ? null : '',
					values: filter === 'ids' ? [''] : []
				}
			};
			//console.debug('QueryFilterSelector filter', filter, 'newValue', newValue);
			dispatch(setValue({
				path: parentPath,
				value: newValue
			}));
		}}
		options={OPTIONS}
		value={value}
	/>
} // function QueryFilterSelector
