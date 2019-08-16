import getIn from 'get-value';
import setIn from 'set-value';
import _ from 'lodash';
import {
	Button, Form, Header, Icon, Loader, Message, Modal, Table
} from 'semantic-ui-react';
import {Checkbox} from './semantic-ui/react/Checkbox';
import {Dropdown} from './semantic-ui/react/Dropdown';
import {Input} from './semantic-ui/react/Input';

import {Form as EnonicForm} from './enonic/Form';
import {Input as EnonicInput} from './enonic/Input';
import {DeleteButton} from './enonic/DeleteButton';
import {ResetButton} from './enonic/ResetButton';
import {SubmitButton} from './enonic/SubmitButton';
import {ValidateFormButton} from './enonic/ValidateFormButton';


function required(value) {
	return value ? undefined : 'Required!';
}


const SCHEMA = {
	displayName: (value) => required(value),
	fieldType: (value) => required(value),
	instruction: (value) => required(value),
	key: (value) => required(value)
};


function NewOrEditModal(props) {
	const {
		disabled = false,
		initialValues = {
			description: '',
			displayName: '',
			fieldType: 'text',
			key: '',
			instruction: 'type',
			decideByType: true,
			enabled: true,
			fulltext: true,
			includeInAllText: true,
			ngram: true,
			path: false
		},
		onClose,
		servicesBaseUrl
	} = props;
	const editMode = !!initialValues.displayName;

	const [dirty, setDirty] = React.useState({});
	const [errors, setErrors] = React.useState({});
	const [open, setOpen] = React.useState(false);
	const [touched, setTouched] = React.useState({});
	const [values, setValues] = React.useState(JSON.parse(JSON.stringify(initialValues)));
	const {
		description,
		displayName,
		fieldType,
		key,
		instruction,
		decideByType,
		enabled,
		fulltext,
		includeInAllText,
		ngram,
		path
	} = values;

	const doClose = () => {
		onClose();
		setOpen(false);
	}
	const onReset = () => {
		setDirty({});
		setErrors({});
		setTouched({});
		setValues(JSON.parse(JSON.stringify(initialValues)));
	};
	const onOpen = () => {
		onReset();
		setOpen(true);
	};
	function onValidate() {
		const errors = {};
		Object.entries(SCHEMA).forEach(([k,v]) => {
			errors[k] = v(getIn(values, k));
		})
		console.debug('onValidate errors', errors);
		setErrors(errors);
		setTouched({
			displayName: true,
			fieldType: true,
			instruction: true,
			key: true
		});
	}

	const callbacks = {
		getError: (name) => getIn(errors, name),
		getTouched: (name) => getIn(touched, name, false),
		getValue: (name) => getIn(values, name),
		setDirty: (name, value) => {
			const old = getIn(dirty, name, false);
			if (value === old) { return; } // No need to change state, or cause render
			setDirty(prev => {
				const deref = JSON.parse(JSON.stringify(prev)); // So render gets triggered. Object.is comparison algorithm.
				return setIn(deref, name, value);
			});
		},
		setError: (name, value) => {
			const old = getIn(errors, name);
			if (value === old) { return; } // No need to change state, or cause render
			setErrors(prev => {
				const deref = JSON.parse(JSON.stringify(prev)); // So render gets triggered. Object.is comparison algorithm.
				return setIn(deref, name, value);
			});
		},
		setTouched: (name, value) => {
			const old = getIn(touched, name);
			if (value === old) { return; } // No need to change state, or cause render
			setTouched(prev => {
				const deref = JSON.parse(JSON.stringify(prev)); // So render gets triggered. Object.is comparison algorithm.
				return setIn(deref, name, value);
			});
		},
		setValue: (name, value) => {
			const old = getIn(values, name);
			if (value === old) { return; } // No need to change state, or cause render
			setValues(prev => {
				const deref = JSON.parse(JSON.stringify(prev)); // So render gets triggered. Object.is comparison algorithm.
				return setIn(deref, name, value);
			});
		}
	};

	//console.debug('NewOrEditModal render', {props, dirty, errors, open, touched, values});
	//console.debug('NewOrEditModal render values', values);

	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={editMode ? <Button
			compact
			disabled={disabled}
			onClick={onOpen}
			size='tiny'
		><Icon color='blue' name='edit'/>Edit</Button>
			: <Button
				circular
				color='green'
				disabled={disabled}
				icon
				onClick={onOpen}
				size='massive'
				style={{
					bottom: 13.5,
					position: 'fixed',
					right: 13.5
				}}><Icon
					name='plus'
				/></Button>}
	>
		<Modal.Header>{editMode ? `Edit field ${initialValues.displayName}`: 'New field'}</Modal.Header>
		<Modal.Content>
			<Form autoComplete='off'>
				{editMode ? null : <Form.Field>
					<Input
						callbacks={callbacks}
						label={{basic: true, content: 'Key'}}
						name='key'
						validate={(value) => SCHEMA.key(value)}
					/>
				</Form.Field>}
				<Form.Field>
					<Input
						callbacks={callbacks}
						label={{basic: true, content: 'Display name'}}
						name='displayName'
						validate={(value) => SCHEMA.displayName(value)}
					/>
				</Form.Field>
				<Form.Field>
					<Input
						callbacks={callbacks}
						label={{basic: true, content: 'Description'}}
						name='description'
					/>
				</Form.Field>
				<Form.Field>
					<Dropdown
						callbacks={callbacks}
						fluid
						name='fieldType'
						options={[{
							key: 'text',
							text: 'Text',
							value: 'text'
						},{
							key: 'tag',
							text: 'Tag',
							value: 'tag'
						},{
							key: 'uri',
							text: 'Uri',
							value: 'uri'
						},{
							key: 'html',
							text: 'Html',
							value: 'html'
						},{
							key: 'base64',
							text: 'Base64 encoded data',
							value: 'base64'
						}]}
						placeholder='Jalla!'
						search
						selection
					/>
				</Form.Field>
				<Form.Field>
					<Dropdown
						callbacks={callbacks}
						fluid
						name='instruction'
						options={[{
							key: 'type',
							text: 'type (default) - Indexing is done based on type; e.g numeric values are indexed as both string and numeric.',
							value: 'type'
						},{
							key: 'minimal',
							text: 'minimal - Value is indexed as a string-value only, no matter what type of data.',
							value: 'minimal'
						},{
							key: 'none',
							text: 'none - Value is not indexed.',
							value: 'none'
						},{
							key: 'fulltext',
							text: 'fulltext - Values are stored as ‘ngram’, ‘analyzed’ and also added to the _allText-field',
							value: 'fulltext'
						},{
							key: 'path',
							text: 'path - Values are stored as ‘path’ type and applicable for the pathMatch-function',
							value: 'path'
						},{
							key: 'custom',
							text: 'custom - use settings below',
							value: 'custom'
						}]}
						search
						selection
					/>
				</Form.Field>
				{getIn(values, 'instruction') === 'custom' && <>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Decide by type'
							name='decideByType'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Enabled'
							name='enabled'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Ngram'
							name='ngram'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Fulltext'
							name='fulltext'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Include in _allText'
							name='includeInAllText'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='Path'
							name='path'
							toggle
						/>
					</Form.Field>
				</>}
				<Button onClick={onValidate} type='button'>Validate</Button>
				<Button
					disabled={
						//Object.values(errors).some((v) => v)
						Object.entries(SCHEMA).some(([k,v]) => v(getIn(values, k)))
					}
					onClick={() => {
						const params = {
							description,
							displayName,
							fieldType,
							key,
							instruction,
							decideByType,
							enabled,
							fulltext,
							includeInAllText,
							ngram,
							path
						};
						//console.debug('params', params);
						fetch(`${servicesBaseUrl}/field${editMode ? 'Modify' : 'Create'}?json=${JSON.stringify(params)}`, {
							method: 'POST'
						}).then(response => {
							doClose();
						})
					}}
					type="submit">Submit</Button>
				<Button
					disabled={!Object.values(dirty).some((v) => v)}
					onClick={onReset}
					type="reset"
				>Reset</Button>
			</Form>
		</Modal.Content>
	</Modal>;
} // NewOrEditModal


function DeleteModal(props) {
	const {
		disabled,
		name,
		onClose,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);
	return <Modal
		closeIcon
		onClose={onClose}
		open={open}
		trigger={<Button
			compact
			disabled={disabled}
			onClick={() => setOpen(true)}
			size='tiny'><Icon color='red' name='trash alternate outline'/>Delete</Button>}
	>
		<Modal.Header>Delete field {name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {name}?</Header>
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/fieldDelete?name=${name}`, {
						method: 'DELETE'
					}).then(response => {
						//if (response.status === 200) {}
						setOpen(false);
						onClose();
					})
				}}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteModal


function EditFieldValuesModal(props) {
	const {
		disabled,
		field,
		onClose,
		servicesBaseUrl,
		valuesRes
	} = props;

	const [isLoading, setLoading] = React.useState(false);
	const [open, setOpen] = React.useState(false);
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

	return <Modal
		closeIcon
		onClose={onClose}
		open={open}
		trigger={<Button
			compact
			disabled={disabled}
			onClick={() => setOpen(true)}
			size='tiny'><Icon color='blue' name='edit'/>Edit values</Button>}
	>
		<Modal.Header>Edit values for field {field}</Modal.Header>
		<Modal.Content>
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
		</Modal.Content>
	</Modal>;
} // EditFieldValuesModal


export function Fields(props) {
	const {
		defaultFields = [],
		noValuesFields = [],
		servicesBaseUrl
	} = props;

	const [state, setState] = React.useState({
		column: 'key',
		direction: 'ascending',
		fieldsRes: {
			count: 0,
			hits: [],
			total: 0
		},
		isLoading: true
	});
	//console.debug('Fields', {props, state});

	const {
		column,
		direction,
		fieldsRes,
		isLoading
	} = state;

	function fetchFields() {
		setState(prev => ({
			...prev,
			isLoading: true
		}));
		fetch(`${servicesBaseUrl}/fieldList`)
			.then(response => response.json())
			.then(data => setState(prev => ({
				...prev,
				...data,
				isLoading: false
			})));
	} // fetchFields

	const handleSortGenerator = (clickedColumn) => () => {
		const {
			fieldsRes,
			column,
			direction
		} = state;
		/*console.debug('handleSort', {
			clickedColumn,
			fieldsRes,
			column,
			direction
		});*/

		if (column !== clickedColumn) {
			fieldsRes.hits = _.sortBy(fieldsRes.hits, [clickedColumn]);
			setState(prev => ({
				...prev,
				column: clickedColumn,
				fieldsRes,
				direction: 'ascending'
			}));
			return;
		}

		fieldsRes.hits = fieldsRes.hits.reverse();
		setState(prev => ({
			...prev,
			fieldsRes,
			direction: direction === 'ascending' ? 'descending' : 'ascending'
		}));
	} // handleSortGenerator

	React.useEffect(() => fetchFields(), []);

	return <>
		<Header as='h1'>Fields</Header>
		{isLoading
			? <Loader active inverted>Loading</Loader>
			: <>
				<Table celled collapsing compact selectable singleLine sortable striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell
								onClick={handleSortGenerator('key')}
								sorted={column === 'key' ? direction : null}
							>Key</Table.HeaderCell>
							<Table.HeaderCell
								onClick={handleSortGenerator('displayName')}
								sorted={column === 'displayName' ? direction : null}
							>Display name</Table.HeaderCell>
							<Table.HeaderCell
								onClick={handleSortGenerator('fieldType')}
								sorted={column === 'fieldType' ? direction : null}
							>Type</Table.HeaderCell>
							<Table.HeaderCell
								onClick={handleSortGenerator('values')}
								sorted={column === 'values' ? direction : null}
							>Values</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{fieldsRes.hits.map(({
							displayName = '',
							fieldType = 'text',
							key,
							name,
							instruction,
							decideByType,
							enabled,
							fulltext,
							includeInAllText,
							ngram,
							path,
							valuesRes
						}, index) => {
							const boolDefaultField = defaultFields.includes(name);
							return <Table.Row key={`field[${index}]`}>
								<Table.Cell>{key}</Table.Cell>
								<Table.Cell>{displayName}</Table.Cell>
								<Table.Cell>{fieldType}</Table.Cell>
								<Table.Cell>{valuesRes.hits.map(({displayName})=>displayName).join(', ')}</Table.Cell>
								<Table.Cell>
									<NewOrEditModal
										disabled={boolDefaultField}
										initialValues={{
											displayName,
											fieldType,
											key,
											instruction,
											decideByType,
											enabled,
											fulltext,
											includeInAllText,
											ngram,
											path
										}}
										onClose={fetchFields}
										servicesBaseUrl={servicesBaseUrl}
									/>
									<EditFieldValuesModal
										disabled={noValuesFields.includes(name)}
										field={name}
										onClose={fetchFields}
										servicesBaseUrl={servicesBaseUrl}
										valuesRes={valuesRes}
									/>
									<DeleteModal
										disabled={boolDefaultField}
										name={name}
										onClose={fetchFields}
										servicesBaseUrl={servicesBaseUrl}
									/>
								</Table.Cell>
							</Table.Row>;
						})}
					</Table.Body>
				</Table>
				<NewOrEditModal
					onClose={fetchFields}
					servicesBaseUrl={servicesBaseUrl}
				/>
			</>
		}
	</>;
} // Fields
