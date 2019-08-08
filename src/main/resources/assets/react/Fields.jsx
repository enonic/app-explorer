import _ from 'lodash';
import {
	Button, Form, Header, Icon, Input, Loader, Message, Modal, Table
} from 'semantic-ui-react';


function NewOrEditModal(props) {
	const {
		initialValues = {},
		servicesBaseUrl
	} = props;

	const [dirty, setDirty] = React.useState(false);
	const [open, setOpen] = React.useState(false);
	const [touched, setTouched] = React.useState({});
	const [values, setValues] = React.useState(initialValues);

	console.debug('NewOrEditModal', {props, open, touched, values});

	const onClose = () => setOpen(false);
	const onOpen = () => setOpen(true);

	const {
		displayName
	} = values;

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
				{/*{props.key || <Form.Field><Input
					label={{basic: true, content: 'Key'}}
					onChange={(eventIgnored, {value}) => setState(prev => ({
						...prev,
						key: value
					}))}
					value={key}
				/></Form.Field>}*/}
				<Form.Field>
					<Input
						name='displayName'
						label={{basic: true, content: 'Display name'}}
						onBlur={() => setTouched(prev => ({...prev, displayName: true}))}
						onChange={(eventIgnored, {value}) => {
							setDirty(prev => ({...prev, displayName: initialValues.displayName !== value}));
							setTouched(prev => ({...prev, displayName: true}));
							setValues(prev => ({...prev, displayName: value}));
						}}
						value={displayName}
					/>
					{touched.displayName && !displayName && <Message icon negative>
						<Icon name='warning'/>
						<Message.Content>
							<Message.Header>Display name</Message.Header>
							Required!
						</Message.Content>
					</Message>}
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
							displayName,
							fieldType,
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
