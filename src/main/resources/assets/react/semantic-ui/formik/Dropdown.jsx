import classNames from 'classnames';
import {connect, Field, getIn} from 'formik';
import generateUuidv4 from 'uuid/v4';

import {optionsObjToArr} from '../../utils/optionsObjToArr';
import {isSet} from '../../utils/isSet';
//import {toStr} from '../../utils/toStr';


const buildDefaultChildren = ({
	placeholder,
	optgroupsArr,
	optionsArr
}) => {
	return <>
		{placeholder ? <option disabled={true} value=''>{placeholder}</option> : null}
		{optgroupsArr.map(({
			label: optgroupLabel,
			options: optgroupOptions
		}) => <optgroup key={generateUuidv4()} label={optgroupLabel}>{optgroupOptions.map(({
			disabled = false,
			label: optionLabel,
			value: optionValue = null
		}) => <option
			key={generateUuidv4()}
			disabled={disabled}
			key={optionValue}
			value={optionValue}
		>{optionLabel}</option>)}</optgroup>)}
		{optionsArr.map(({
			disabled = false,
			label: optionLabel,
			value: optionValue = null
		}) => <option
			key={generateUuidv4()}
			disabled={disabled}
			key={optionValue}
			value={optionValue}
		>{optionLabel || optionValue}</option>)}
	</>;
} // buildDefaultChildren


export const Dropdown = connect(({
	// React
	className,
	multiple = false,

	// Semantic-ui
	fluid = false,
	search = false,
	selection = false,

	// Formik
	component, // So it doesn't end up in ...rest
	formik: {
		setFieldValue,
		values
	},
	onChange = ({
		target: {
			selectedOptions // HTMLCollection
		}
	}) => {
		const htmlCollectionAsArray = [].slice
			.call(selectedOptions)
			.map(({value}) => value);
		const newValue = multiple ? htmlCollectionAsArray : htmlCollectionAsArray[0];
		//console.debug({multiple, path, htmlCollectionAsArray, newValue});
		setFieldValue(path, newValue);
	},

	// Various
	placeholder = null,
	name,
	path = parentPath ? `${parentPath}.${name}` : name,
	optgroups = [],
	optgroupsArr = optionsObjToArr(optgroups),
	options = [],
	optionsArr = optionsObjToArr(options),
	value = getIn(values, path, multiple ? [] : ''),

	children = buildDefaultChildren({
		placeholder,
		optgroupsArr,
		optionsArr
	}),
	...rest
}) => {
	/*console.debug(toStr({
		component: 'SemanticUi/Formik/Dropdown',
		path,
		value//,
		//placeholder,
		//optgroups,
		//optgroupsArr,
		//options,
		//optionsArr
	}));*/
	return <Field
		className={classNames(
			className,
			{fluid, search, selection},
			'ui dropdown'
		)}
		component='select'
		multiple={multiple}
		name={path}
		onChange={onChange}
		value={value}
		{...rest}
	>{children}</Field>;
}) // Dropdown
