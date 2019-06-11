import classNames from 'classnames';
import {connect, getIn} from 'formik';
import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';


export const Dropdown = connect(({
	// React
	className,
	multiple = false,
	placeholder,

	// Semantic-ui
	fluid = false,
	search = false,
	selection = false,

	// Various before formik onChange
	name,
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,

	// Formik
	formik: {
		setFieldValue,
		values
	},
	onChange = (event, {
		value: newValue
	}) => {
		//console.debug({event, newValue});
		setFieldValue(path, newValue);
	},

	// Various after formik values
	defaultValue = getIn(values, path, multiple ? [] : ''),

	...rest // options
}) => {
	return <SemanticUiReactDropdown
		className={classNames(
			className,
			{fluid, search, selection},
			'ui dropdown'
		)}
		defaultValue={defaultValue}
		multiple={multiple}
		name={path}
		onChange={onChange}
		placeholder={placeholder}
		{...rest}
	/>;
});
