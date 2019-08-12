import getIn from 'get-value';
import setIn from 'set-value';
import _ from 'lodash';
import {
	Button, Form, Header, Icon, Loader, Message, Modal, Table
} from 'semantic-ui-react';
import {Input} from './semantic-ui/react/Input';


function NewOrEditModal(props) {
	const [open, setOpen] = React.useState(false);
	const onClose = () => setOpen(false);
	const onOpen = () => setOpen(true);

	const {
		initialValues = {
			displayName: '',
			fieldType: 'text',
			//indexConfig: '',
			key: ''
		},
		servicesBaseUrl
	} = props;

	const [dirty, setDirty] = React.useState({});
	const [errors, setErrors] = React.useState({});
	const [touched, setTouched] = React.useState({});
	const [values, setValues] = React.useState(JSON.parse(JSON.stringify(initialValues))); // Dereference

	const callbacks = {
		getTouched: (name) => {
			const value = getIn(touched, name, false);
			console.debug('getTouched name', name, 'value', value);
			return value;
		},
		getError: (name) => {
			const value = getIn(errors, name);
			console.debug('getError name', name, 'value', value);
			return value;
		},
		getValue: (name) => {
			const value = getIn(values, name);
			console.debug('getValue name', name, 'value', value);
			return value;
		},
		setDirty: (name, dirty) => {
			return setDirty(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				setIn(prev, name, dirty);
				console.debug('setDirty name', name, 'dirty', dirty, 'prev', deref, 'new', prev);
				return prev;
			});
		},
		setErrors: (name, error) => {
			return setErrors(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				setIn(prev, name, error);
				console.debug('setErrors name', name, 'error', error, 'prev', deref, 'new', prev);
				return prev;
			});
		},
		setTouched: (name, touched) => {
			return setTouched(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				setIn(prev, name, touched);
				console.debug('setTouched name', name, 'touched', touched, 'prev', deref, 'new', prev);
				return prev;
			});
		},
		setValues: (name, value) => {
			return setValues(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				setIn(prev, name, value);
				console.debug('setValues name', name, 'value', value, 'prev', deref, 'new', prev);
				return prev;
			});
		}
	};

	console.debug('NewOrEditModal', {props, dirty, errors, open, touched, values});

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
						validate={(value) => value ? undefined : 'Required'}
					/>
				</Form.Field>}
				<Form.Field>
					<Input
						callbacks={callbacks}
						label={{basic: true, content: 'Display name'}}
						name='displayName'
						validate={(value) => value ? undefined : 'Required'}
					/>
				</Form.Field>
				{/*<Form.Field><Input
					label={{basic: true, content: 'Description'}}
					onChange={(eventIgnored, {value}) => setState(prev => ({
						...prev,
						description: value
					}))}
					value={description}
				/></Form.Field>
				<Form.Field>
					<Input
						label={{basic: true, content: 'Type'}}
						onChange={(eventIgnored, {value}) => setState(prev => ({
							...prev,
							fieldType: value
						}))}
						value={fieldType}
					/>
				</Form.Field>
				<Form.Field>
					<Input
						label={{basic: true, content: 'Index config'}}
						onChange={(eventIgnored, {value}) => setState(prev => ({
							...prev,
							indexConfig: value
						}))}
						value={indexConfig}
					/>
				</Form.Field>*/}
				<Button type="submit">Submit</Button>
				<Button
					disabled={!Object.values(dirty).some((v) => v)}
					onClick={() => {
						setDirty({});
						setTouched({});
						setValues(initialValues);
					}}
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
