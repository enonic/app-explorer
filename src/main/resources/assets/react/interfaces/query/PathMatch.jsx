import {Form} from 'semantic-ui-react';

import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';

import {fieldObjToFieldArr} from './fieldObjToFieldArr';


export function PathMatch(props) {
	const {
		disabled = false,
		fieldsObj,
		name = 'pathMatch',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name
	} = props;
	const fieldOptions = fieldObjToFieldArr(fieldsObj);
	return <>
		<Form.Field>
			<Dropdown
				disabled={disabled}
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
				disabled={disabled}
				fluid
				path={`${path}.path`}
				placeholder='Path'
			/>
		</Form.Field>
		<Form.Field>
			<Input
				disabled={disabled}
				fluid
				path={`${path}.minMatch`}
				type='number'
			/>
		</Form.Field>
	</>;
} // function PathMatch
