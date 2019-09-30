import {Dropdown} from '../../enonic/Dropdown';


export function QueryFilterSelector(props) {
	//console.debug('QueryFilterSelector props', props);
	const {
		options = [{
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
		}],
		parentPath,
		name = 'filter',
		path = parentPath ? `${parentPath}.${name}` : name
	} = props;
	//console.debug('QueryFilterSelector path', path);
	return <Dropdown
		options={options}
		path={path}
	/>
} // function QueryFilterSelector
