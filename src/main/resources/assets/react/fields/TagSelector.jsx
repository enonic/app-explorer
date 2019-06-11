import {connect, getIn} from 'formik';
import {Select} from '../elements/Select';

//import {toStr} from '../utils/toStr';


export const TagSelector = connect(({
	formik: {
		values
	},
	//label, // in rest
	multiple = false,
	name = `tag${multiple ? 's' : ''}`,
	options = [],
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	//placeholder, // in rest
	tags = options,
	value = values && getIn(values, path) || '',
	...rest // size
}) => {
	//console.debug(toStr({component: 'TagSelector', tags, path, value, rest}));
	return <Select
		multiple={multiple}
		name={path}
		options={tags}
		value={value}
		{...rest}
	/>;
}); // TagSelector
