import {Form} from 'semantic-ui-react';

import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {fieldObjToFieldArr} from './fieldObjToFieldArr';


export function Range(props) {
	const {
		fieldsObj,
		name = 'range',
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
			<Input
				fluid
				path={`${path}.from`}
				placeholder='From'
			/>
		</Form.Field>
		<Form.Field>
			<Input
				fluid
				path={`${path}.to`}
				placeholder='To'
			/>
		</Form.Field>
		<Form.Field>
			<Checkbox
				label='Include from?'
				path={`${path}.includeFrom`}
			/>
		</Form.Field>
		<Form.Field>
			<Checkbox
				label='Include to?'
				path={`${path}.includeTo`}
			/>
		</Form.Field>
	</>;
} // function Range
