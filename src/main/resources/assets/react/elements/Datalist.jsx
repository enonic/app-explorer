// WIP
import {connect, Field, getIn} from 'formik';
import generateUuidv4 from 'uuid/v4';

import {Label} from './Label';

import {toStr} from '../utils/toStr';


export const Datalist = connect(({
	formik: {
		setFieldValue,
		values
	},
	component, // So it doesn't end up in rest
	label,
	multiple = false, // https://stackoverflow.com/questions/14148538/multiple-selections-with-datalist
	parentPath,
	name,
	path = parentPath ? `${parentPath}.${name}` : name,
	options,
	placeholder = null,
	value = values && getIn(values, path, ''),
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
		setFieldValue(path, newValue)
	},
	...rest
}) => {
	console.debug(toStr({
		//parentPath,
		//name,
		path,
		options,
		rest
	}));
	const listId = generateUuidv4();
	const fragment = <>
		<datalist id={listId}>
			{options.map(({label: optionLabel, value: optionValue = null}) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
		</datalist>
		{/*
			https://stackoverflow.com/questions/14148538/multiple-selections-with-datalist
			multiple={multiple}
			component="select"
		*/}
		<Field
			list={listId}
			name={path}
			onChange={onChange}
			placeholder={placeholder}
			{...rest}
		/>
	</>;
	if(!label) { return fragment; }
	return <Label label={label}>{fragment}</Label>;
}); // function Datalist
