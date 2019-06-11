import {connect, getIn} from 'formik';
import {Select} from '../elements/Select';


export const CompareExpressionOperator = connect(({
	formik: {
		values
	},
	name = 'operator',
	options = [{
		label: 'EQ (=)',
		//label: '=',
		value: '='
	},{
		label: 'NEQ (!=)',
		//label: '!=',
		value: '!='
	},{
		label: 'GT (>)',
		//label: '>',
		value: '>'
	},{
		label: 'GTE (>=)',
		//label: '>=',
		value: '>='
	},{
		label: 'LT (<)',
		//label: '<',
		value: '<'
	},{
		label: 'LTE (<=)',
		//label: '<=',
		value: '<='
	},{
		label: 'LIKE',
		value: 'LIKE'
	},{
		label: 'NOT LIKE',
		value: 'NOT LIKE'
	},{
		label: 'IN',
		value: 'IN'
	},{
		label: 'NOT IN',
		value: 'NOT IN'
	}],
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	value = values && getIn(values, path),
	...rest
}) => {
	return <Select
		name={path}
		options={options}
		value={value}
		{...rest}
	/>;
}); // CompareExpressionOperatorSelector
