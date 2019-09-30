import {Form} from 'semantic-ui-react';

import {Dropdown} from '../../enonic/Dropdown';
import {Input} from '../../enonic/Input';

import {fieldObjToFieldArr} from './fieldObjToFieldArr';


export function PathMatch(props) {
	const {
		fieldsObj,
		name = 'pathMatch',
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
				path={`${path}.path`}
				placeholder='Path'
			/>
		</Form.Field>
		<Form.Field>
			<Input
				fluid
				path={`${path}.minMatch`}
				type='number'
			/>
		</Form.Field>
	</>;
} // function PathMatch
