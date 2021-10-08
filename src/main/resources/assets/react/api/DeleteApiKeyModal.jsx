import {
	Button,
	Header,
	Icon,
	Modal,
	Popup
} from 'semantic-ui-react';


export const DeleteApiKeyModal = (props) => {
	//console.debug('props', props);
	const {
		_name,
		afterClose = () => {},
		beforeOpen = () => {},
		servicesBaseUrl
	} = props;
	const [state, setState] = React.useState({
		open: false
	});

	const doClose = () => {
		setState({open: false});
		afterClose();
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setState({open: true});
	};

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={state.open}
		size='tiny'
		trigger={<Popup
			content={`Delete API Key ${_name}`}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='red' name='trash alternate outline'/></Button>}/>
		}
	>
		<Modal.Header>{`Delete API Key ${_name}`}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {_name}?</Header>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<Button
				onClick={() => {
					fetch(`${servicesBaseUrl}/apiKeyDelete?name=${_name}`, {
						method: 'DELETE'
					}).then((/*response*/) => {
						//if (response.status === 200) {}
						doClose();
					});
				}}
				primary
			><Icon color='white' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Actions>
	</Modal>;
}; // DeleteApiKeyModal
