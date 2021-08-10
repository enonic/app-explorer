import {Form} from 'semantic-ui-react';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Input} from 'semantic-ui-react-form/inputs/Input';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';


const CREATE_SCHEMA_GQL = `mutation CreateSchemaMutation($_name: String!) {
  createSchema(_name: $_name) {
    _id
    _name
    _path
  }
}`;


export function NewOrEditSchema({
	doClose,
	//_id,
	initialValues = {
		_name: ''
	},
	servicesBaseUrl
}) {
	return <EnonicForm
		initialValues={initialValues}
		onSubmit={(values) => {
			console.debug('submit values', values);
			const {_name} = values;
			console.debug('submit _name', _name);

			fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify({
					query: CREATE_SCHEMA_GQL,
					variables: {
						_name
					}
				})
			}).then(response => {
				if (response.status === 200) { doClose(); }
			});
		}}
	>
		<Form as='div'>
			<Form.Field>
				<Input
					fluid
					label={{basic: true, content: 'Name'}}
					path='_name'
					placeholder='Please input an unique name'
				/>
			</Form.Field>
		</Form>
		<Form.Field>
			<SubmitButton/>
			<ResetButton/>
		</Form.Field>
	</EnonicForm>;
} // NewOrEditSchema
