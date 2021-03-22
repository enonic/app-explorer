import {
	Button,
	Form,
	Header,
	Icon,
	//Label,
	Modal,
	Popup,
	Table
} from 'semantic-ui-react';

import {
	Form as EnonicForm,
	Input,
	ResetButton,
	SubmitButton
} from 'semantic-ui-react-form';

import {useInterval} from './utils/useInterval';


const API_KEYS_GQL = `{
	queryApiKeys {
		#total
		#count
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
			key: _name ? '' : makeKey()//,
			//name: _name
		},
		onClose,
		servicesBaseUrl
	} = props;

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
		{_name
			? null
			: <Input
				fluid
				label='Name'
				path='name'
			/>
		}
		<Input
			fluid
			label='Key'
			path='key'
			placeholder={_name ? 'If you type anything here, it will overwrite the previous key on save' : 'Key is one way hashed on save'}
		/>
		<Form.Field>
			<SubmitButton/>
			<ResetButton/>
		</Form.Field>
	</EnonicForm>;
}; // NewOrEditApiKey


const NewOrEditApiKeyModal = (props) => {
	//console.debug('props', props);
	const {
		_name,
		initialValues,
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
	const [boolPoll, setBoolPoll] = React.useState(true);

	const fetchApiKeys = () => {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: API_KEYS_GQL })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data) {
					setQueryApiKeysGraph(res.data.queryApiKeys);
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
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{queryApiKeysGraph.hits && queryApiKeysGraph.hits.map(({
					_name
				}) => {
					return <Table.Row key={_name}>
						<Table.Cell collapsing>
							<NewOrEditApiKeyModal
								_name={_name}
								onClose={() => {
									fetchApiKeys();
									setBoolPoll(true);
								}}
								onOpen={() => {
									setBoolPoll(false);
								}}
								servicesBaseUrl={servicesBaseUrl}
							/>
						</Table.Cell>
						<Table.Cell>{_name}</Table.Cell>
						<Table.Cell collapsing>
							<DeleteApiKeyModal
								_name={_name}
								onClose={() => {
									fetchApiKeys();
									setBoolPoll(true);
								}}
								onOpen={() => {
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
				fetchApiKeys();
				setBoolPoll(true);
			}}
			onOpen={() => {
				setBoolPoll(false);
			}}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
};
