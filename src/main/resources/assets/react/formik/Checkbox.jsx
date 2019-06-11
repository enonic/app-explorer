import {connect, Field, getIn} from 'formik';

//import {toStr} from '../utils/toStr';


export const Checkbox = connect(({
	formik: {
		values
	},
	name,
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	checked = getIn(values, path),
	...rest
}) => {
	/*console.debug(toStr({
		component: 'Formik/Checkbox',
		parentPath, name, path,
		checked,
		rest
	}));*/
	return <Field
		checked={checked}
		name={path}
		type='checkbox'
		{...rest}
	/>;
});
