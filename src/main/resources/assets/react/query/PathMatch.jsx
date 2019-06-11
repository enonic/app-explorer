import {connect, getIn} from 'formik';

import {NumberInput} from '../elements/NumberInput';
import {TextInput} from '../elements/TextInput';
import {FieldSelector} from '../fields/FieldSelector';


export const PathMatch = connect(({
	fields,
	formik: {
		values
	},
	name = 'pathMatch',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	value = getIn(values, path)
}) => {
	return <>
		<FieldSelector
			parentPath={path}
			fields={fields}
		/>
		<TextInput
			name='path'
			placeholder='Path'
			parentPath={path}
		/>
		<NumberInput
			name='minMatch'
			parentPath={path}
		/>
	</>;
}); // PathMatch
