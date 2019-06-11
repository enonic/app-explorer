import {connect, getIn} from 'formik';


import {TextInput} from '../elements/TextInput';
import {FieldSelector} from '../fields/FieldSelector';

import {CompareExpressionOperator} from './CompareExpressionOperator';


export const CompareExpression = connect(({
	fields,
	formik: {
		values
	},
	name = 'compareExpr',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	value = getIn(values, path)
}) => {
	return <>
		<FieldSelector
			parentPath={path}
			fields={fields}
		/>
		<CompareExpressionOperator
			parentPath={path}
		/>
		<TextInput
			name='valueExpr'
			parentPath={path}
		/>
	</>;
}); // CompareExpression
