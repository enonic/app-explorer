import {Form} from 'semantic-ui-react';

import {Dropdown} from '../../enonic/Dropdown';
import {Input} from '../../enonic/Input';

import {fieldObjToFieldArr} from './fieldObjToFieldArr';

const OPERATOR_OPTIONS = [{
	text: 'EQ (=)',
	//text: '=',
	value: '='
},{
	text: 'NEQ (!=)',
	//text: '!=',
	value: '!='
},{
	text: 'GT (>)',
	//text: '>',
	value: '>'
},{
	text: 'GTE (>=)',
	//text: '>=',
	value: '>='
},{
	text: 'LT (<)',
	//text: '<',
	value: '<'
},{
	text: 'LTE (<=)',
	//text: '<=',
	value: '<='
},{
	text: 'LIKE',
	value: 'LIKE'
},{
	text: 'NOT LIKE',
	value: 'NOT LIKE'
},{
	text: 'IN',
	value: 'IN'
},{
	text: 'NOT IN',
	value: 'NOT IN'
}].map(({
	text, value
}) => ({
	key: value, text, value
}));


export function CompareExpression(props) {
	const {
		fieldsObj,
		name = 'compareExpr',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name
	} = props;
	const fieldOptions = fieldObjToFieldArr(fieldsObj);
	return <>
		<Form.Field>
			<Dropdown
				fluid
				options={fieldOptions}
				path={`${path}.field`}
				placeholder='Please select a field'
				search
				selection
			/>
		</Form.Field>
		<Form.Field>
			<Dropdown
				fluid
				options={OPERATOR_OPTIONS}
				path={`${path}.operator`}
				selection
			/>
		</Form.Field>
		<Form.Field>
			<Input
				fluid
				path={`${path}.valueExpr`}
			/>
		</Form.Field>
	</>;
} // function CompareExpression
