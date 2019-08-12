import getIn from 'get-value';
import setIn from 'set-value';
import _ from 'lodash';
import {
	Button, Form, Header, Icon, Loader, Message, Modal, Table
} from 'semantic-ui-react';
import {Checkbox} from './semantic-ui/react/Checkbox';
import {Dropdown} from './semantic-ui/react/Dropdown';
import {Input} from './semantic-ui/react/Input';


function required(value) {
	return value ? undefined : 'Required!';
}


const SCHEMA = {
	displayName: (value) => required(value),
	fieldType: (value) => required(value),
	indexConfig: (value) => required(value),
	key: (value) => required(value)
};


function NewOrEditModal(props) {
	const {
		initialValues = {
			decideByType: true,
			displayName: '',
			enabled: true,
			fieldType: 'text',
			fulltext: true,
			includeInAllText: true,
			indexConfig: 'type',
			key: '',
			ngram: true,
			path: false
		},
		servicesBaseUrl
	} = props;

	const [dirty, setDirty] = React.useState({});
	const [errors, setErrors] = React.useState({});
	const [open, setOpen] = React.useState(false);
	const [touched, setTouched] = React.useState({});
	const [values, setValues] = React.useState(JSON.parse(JSON.stringify(initialValues))); // Dereference

	const onClose = () => setOpen(false);
	const onReset = () => {
		setDirty({});
		setErrors({});
		setTouched({});
		setValues(initialValues);
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
			indexConfig: true,
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

	console.debug('NewOrEditModal render', {props, dirty, errors, open, touched, values});

	return <Modal
		closeIcon
		onClose={onClose}
		open={open}
		trigger={initialValues.displayName ? <Button
			compact
			onClick={onOpen}
			size='tiny'
		><Icon color='blue' name='edit'/>Edit</Button>
			: <Button
				circular
				color='green'
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
		<Modal.Header>{initialValues.displayName ? `Edit field ${initialValues.displayName}`: 'New field'}</Modal.Header>
		<Modal.Content>
			<Form autoComplete='off'>
				{initialValues.displayName ? null : <Form.Field>
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
						name='indexConfig'
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
				{getIn(values, 'indexConfig') === 'custom' && <>
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
							label='nGram'
							name='nGram'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='fulltext'
							name='fulltext'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='includeInAllText'
							name='includeInAllText'
							toggle
						/>
					</Form.Field>
					<Form.Field>
						<Checkbox
							callbacks={callbacks}
							label='path'
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


export function Fields(props) {
	const {
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
							indexConfig,
							key,
							valuesRes
						}, index) => <Table.Row key={`field[${index}]`}>
							<Table.Cell>{key}</Table.Cell>
							<Table.Cell>{displayName}</Table.Cell>
							<Table.Cell>{fieldType}</Table.Cell>
							<Table.Cell>{valuesRes.hits.map(({displayName})=>displayName)}</Table.Cell>
							<Table.Cell>
								<NewOrEditModal
									initialValues={{
										displayName,
										fieldType,
										indexConfig,
										key
									}}
									servicesBaseUrl={servicesBaseUrl}
								/>
							</Table.Cell>
						</Table.Row>)}
					</Table.Body>
				</Table>
				<NewOrEditModal
					servicesBaseUrl={servicesBaseUrl}
				/>
			</>
		}
	</>;
} // Fields
