import {connect, getIn} from 'formik';
import {Select} from '../elements/Select';


export const ResultMappingTypeSelector = connect(({
	formik: {
		values
	},
	name = 'type',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	value = values && getIn(values, path) || 'string',
	...rest
}) => <Select
	path={path}
	options={[{
		label: 'String',
		value: 'string'
	}, {
		label: 'Tag(s)',
		value: 'tags'
	}]}
	value={value}
	{...rest}
/>); // ResultMappingTypeSelector
