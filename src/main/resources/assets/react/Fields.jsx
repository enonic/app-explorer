import getIn from 'get-value';
import setIn from 'set-value';
import _ from 'lodash';
import {
	Button, Form, Header, Icon, Loader, Message, Modal, Table
} from 'semantic-ui-react';
import {Input} from './semantic-ui/react/Input';
//import { string, object } from 'yup';


function required(value) {
	return value ? undefined : 'Required!';
}

const SCHEMA = {
	displayName: (value) => required(value),
	key: (value) => required(value)
};

/*const SCHEMA = object({
	key: string().required(),
	displayName: string().required()
});*/


function NewOrEditModal(props) {
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
	const [open, setOpen] = React.useState(false);
	const [touched, setTouched] = React.useState({});
	const [values, setValues] = React.useState(JSON.parse(JSON.stringify(initialValues))); // Dereference

	/*function validateSyncAt(path) {
		try {
			SCHEMA.validateSyncAt(path, values);
			console.debug('validateSyncAt', path, 'valid', undefined);
		} catch (e) {
			//console.debug(e);
			console.debug('validateSyncAt', path, 'invalid', e.message);
			return e.message;
		}
		return undefined;
	}*/

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
		/*setErrors({
			displayName: validateSyncAt('displayName'),
			key: validateSyncAt('key')
		});*/
		setTouched({
			displayName: true,
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
				<Button onClick={onValidate} type='button'>Validate</Button>
				<Button
					disabled={Object.values(errors).some((v) => v)}
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
