import {
	Button,
	Form,
	Header,
	Icon,
	//Input as SemanticUiReactInput,
	Label,
	Modal,
	Popup,
	Table
} from 'semantic-ui-react';

import {
	Form as EnonicForm,
	Input as EnonicInput,
	ResetButton,
	SubmitButton
} from 'semantic-ui-react-form';

import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';

import {GenerateKeyButton} from './api/GenerateKeyButton';

import {useInterval} from './utils/useInterval';


const GQL = `{
	queryApiKeys {
		#total
		#count
		hits {
			_name
			collections
		}
	}
	queryCollections(
		count: -1
	) {
		hits {
			_name
		}
	}
}`;


function makeKey({
	characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
	length = 32
} = {}) {
	let result = '';
	const charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}


const NewOrEditApiKey = (props) => {
	//console.debug('props', props);
	const {
		_name,
		initialValues = {
			collections: [],
			key: _name ? '' : makeKey()//,
			//name: _name
		},
		onClose,
		queryCollectionsGraph,
		servicesBaseUrl
	} = props;
	//console.debug('initialValues', initialValues);

	const collectionOptions = queryCollectionsGraph.hits ? queryCollectionsGraph.hits.map(({_name: key}) => ({
		key,
		text: key,
		value: key
	})) : [];

	return <EnonicForm
		initialValues={initialValues}
		onSubmit={(values) => {
			//console.debug('submit values', values);
			if (_name) {
				values.name = _name;
			}
			fetch(`${servicesBaseUrl}/apiKey${_name ? 'Modify' : 'Create'}`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify(values)
			}).then((/*response*/) => {
				onClose();
			});
		}}
	>
		<Form as='div'>
			{_name
				? null
				: <Form.Field>
					<EnonicInput
						fluid
						label='Name'
						path='name'
					/>
				</Form.Field>
			}
			<Form.Field>
				<EnonicInput
					fluid
					path='key'
					placeholder={_name ? 'If you type anything here, it will overwrite the previous key on save' : 'Key is one way hashed on save'}
				>
					<Label content='Key' size='big'/>
					<input/>
					<GenerateKeyButton/>
				</EnonicInput>
			</Form.Field>
			<Header as='h2' content='Collection(s)' dividing id='collections'/>
			<Form.Field>
				<Dropdown
					multiple={true}
					options={collectionOptions}
					path='collections'
					placeholder='Please select one or more collections...'
					selection
				/>
			</Form.Field>
			<Form.Field>
				<SubmitButton/>
				<ResetButton/>
			</Form.Field>
		</Form>
	</EnonicForm>;
}; // NewOrEditApiKey


const NewOrEditApiKeyModal = (props) => {
	//console.debug('props', props);
	const {
		_name,
		initialValues,
		onClose = () => {},
		onOpen = () => {},
		queryCollectionsGraph,
		servicesBaseUrl
	} = props;
	const [state, setState] = React.useState({
		open: false
	});
	return <Modal
		closeIcon
		onClose={() => {
			setState({open: false});
			onClose();
		}}
		onOpen={onOpen}
		open={state.open}
		size='large'
		trigger={_name ? <Popup
			content={`Edit API Key ${_name}`}
			inverted
			trigger={<Button
				icon
				onClick={() => setState({open: true})}
			><Icon color='blue' name='edit'/></Button>}/>
			: <Button
				circular
				color='green'
				icon
				onClick={() => setState({open: true})}
				size='massive'
				style={{
					bottom: 13.5,
					position: 'fixed',
					right: 13.5
				}}><Icon
					name='plus'
				/></Button>}
	>
		<Modal.Header>{_name ? `Edit API Key ${_name}`: 'New API Key'}</Modal.Header>
		<Modal.Content>
			<NewOrEditApiKey
				_name={_name}
				initialValues={initialValues}
				onClose={() => {
					setState({open: false});
					onClose();
				}}
				queryCollectionsGraph={queryCollectionsGraph}
				servicesBaseUrl={servicesBaseUrl}
			/>
		</Modal.Content>
	</Modal>;
}; // NewOrEditApiKeyModal


const DeleteApiKeyModal = (props) => {
	//console.debug('props', props);
	const {
		_name,
		onClose = () => {},
		onOpen = () => {},
		servicesBaseUrl
	} = props;
	const [state, setState] = React.useState({
		open: false
	});
	return <Modal
		closeIcon
		onClose={() => {
			setState({open: false});
			onClose();
		}}
		onOpen={onOpen}
		open={state.open}
		size='large'
		trigger={<Popup
			content={`Delete API Key ${_name}`}
			inverted
			trigger={<Button
				icon
				onClick={() => setState({open: true})}
			><Icon color='red' name='trash alternate outline'/></Button>}/>
		}
	>
		<Modal.Header>{`Delete API Key ${_name}`}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {_name}?</Header>
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/apiKeyDelete?name=${_name}`, {
						method: 'DELETE'
					}).then((/*response*/) => {
						//if (response.status === 200) {}
						setState({open: false});
						onClose();
					});
				}}
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
}; // DeleteApiKeyModal


export const Api = (props) => {
	//console.debug('props', props);
	const {
		servicesBaseUrl
	} = props;

	const [queryApiKeysGraph, setQueryApiKeysGraph] = React.useState({});
	const [queryCollectionsGraph, setQueryCollectionsGraph] = React.useState({});
	const [boolPoll, setBoolPoll] = React.useState(true);

	const fetchApiKeys = () => {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data) {
					setQueryApiKeysGraph(res.data.queryApiKeys);
					setQueryCollectionsGraph(res.data.queryCollections);
				}
			});
	};

	React.useEffect(() => fetchApiKeys(), []); // Only once

	useInterval(() => {
		// This will continue to run as long as the Collections "tab" is open
		if (boolPoll) {
			fetchApiKeys();
		}
	}, 2500);

	return <>
		<Header as='h1'>API Keys</Header>
		<Table celled compact selectable sortable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					<Table.HeaderCell>Collections</Table.HeaderCell>
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{queryApiKeysGraph.hits && queryApiKeysGraph.hits.map(({
					_name,
					collections
				}) => {
					return <Table.Row key={_name}>
						<Table.Cell collapsing>
							<NewOrEditApiKeyModal
								_name={_name}
								initialValues={{
									_name,
									collections
								}}
								onClose={() => {
									//console.debug('onClose');
									fetchApiKeys();
									setBoolPoll(true);
								}}
								onOpen={() => {
									console.debug('onOpen'); // For some reason does not get called???
									setBoolPoll(false);
								}}
								queryCollectionsGraph={queryCollectionsGraph}
								servicesBaseUrl={servicesBaseUrl}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
						<Table.Cell>{collections.join(', ')}</Table.Cell>
						<Table.Cell collapsing>
							<DeleteApiKeyModal
								_name={_name}
								onClose={() => {
									//console.debug('onClose');
									fetchApiKeys();
									setBoolPoll(true);
								}}
								onOpen={() => {
									console.debug('onOpen'); // For some reason does not get called???
									setBoolPoll(false);
								}}
								servicesBaseUrl={servicesBaseUrl}
							/>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditApiKeyModal
			onClose={() => {
				//console.debug('onClose');
				fetchApiKeys();
				setBoolPoll(true);
			}}
			onOpen={() => {
				//console.debug('onOpen'); // Why this one gets called and not the other ones is beyond me???
				setBoolPoll(false);
			}}
			queryCollectionsGraph={queryCollectionsGraph}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
};
