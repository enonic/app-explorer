import {
	Button, Loader, Table
} from 'semantic-ui-react';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Input as EnonicInput} from 'semantic-ui-react-form/inputs/Input';
import {DeleteButton} from 'semantic-ui-react-form/buttons/DeleteButton';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
import {ValidateFormButton} from 'semantic-ui-react-form/buttons/ValidateFormButton';


function required(value) {
	return value ? undefined : 'Required!';
}


export function EditValues(props) {
	const {
		field,
		servicesBaseUrl
	} = props;

	const [isLoading, setLoading] = React.useState(false);
	const [values, setValues] = React.useState([]);

	function fetchFieldValues() {
		setLoading(true);
		fetch(`${servicesBaseUrl}/fieldValueList?field=${field}`)
			.then(response => response.json())
			.then(data => {
				setValues(data.valuesRes.hits);
				setLoading(false);
			});
	} // fetchFieldValues

	React.useEffect(() => fetchFieldValues(), []); // Runs once

	return <>
		<Table celled compact selectable singleLine sortable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell width={6}>value</Table.HeaderCell>
					<Table.HeaderCell width={6}>Display name</Table.HeaderCell>
					<Table.HeaderCell width={4}>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{isLoading ? null : values.map((initialValues, index) => {
					const key = `${field}-value-${index}`;
					return <Table.Row key={key}>
						<EnonicForm
							initialValues={initialValues}
							onDelete={({value}) => fetch(`${servicesBaseUrl}/fieldValueDelete?field=${field}&value=${value}`, {
								method: 'DELETE'
							}).then(fetchFieldValues)}
							onSubmit={({displayName, value}) => fetch(`${servicesBaseUrl}/fieldValueCreateOrUpdate?displayName=${displayName}&field=${field}&value=${value}`, {
								method: 'POST'
							}).then(fetchFieldValues)}
							schema={{
								displayName: (value) => required(value),
								value: (value) => required(value)
							}}
						>
							<Table.Cell><EnonicInput fluid path='value'/></Table.Cell>
							<Table.Cell><EnonicInput fluid path='displayName'/></Table.Cell>
							<Table.Cell>
								<Button.Group>
									<SubmitButton/>
									{/*<ResetButton/>
									<ValidateFormButton/>*/}
									<DeleteButton/>
								</Button.Group>
							</Table.Cell>
						</EnonicForm>
					</Table.Row>;
				})}
			</Table.Body>
			{isLoading && <Table.Footer>
				<Table.Row>
					<Table.HeaderCell colSpan='3'><Loader active inverted>Loading</Loader></Table.HeaderCell>
				</Table.Row>
			</Table.Footer>}
		</Table>
		<Button onClick={() => setValues(prev => {
			const deref = JSON.parse(JSON.stringify(prev));
			deref.push({displayName: '', value: ''});
			return deref;
		})} type='button'>Add</Button>
	</>;
} // EditValues
