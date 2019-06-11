import {connect, getIn} from 'formik';

import {Select} from '../../elements/Select';

//import {toStr} from '../utils/toStr';


export const QueryFilterSelector = connect(({
	formik: {
		values
	},
	options = [{
		label: 'Exists',
		value: 'exists'
	},{
		label: 'Has value',
		value: 'hasValue'
	},{
		label: 'Not exists',
		value: 'notExists'
	},{
		label: 'Ids',
		value: 'ids'
	}],
	parentPath,
	name = 'filter',
	path = parentPath ? `${parentPath}.${name}` : name,
	value = getIn(values, path) || 'exists'
}) => {
	//console.debug(toStr({component: 'QueryFilterSelector', parentPath, name, path, value}));
	return <Select
		path={path}
		options={options}
		value={value}
	/>;
});
