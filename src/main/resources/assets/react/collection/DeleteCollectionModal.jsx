import {Button, Header, Icon, Modal, Popup} from 'semantic-ui-react';

export function DeleteCollectionModal(props) {
	const {
		_name,
		afterClose = () => {},
		beforeOpen = () => {},
		disabled = false,
		servicesBaseUrl
	} = props;
	const [state, setState] = React.useState({
		open: false
	});
	//console.debug('DeleteModal', {props, state});

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
		size='small'
		trigger={<Popup
			content={`Delete collection ${_name}`}
			inverted
			trigger={<Button
				disabled={disabled}
				icon
				onClick={doOpen}><Icon color='red' name='trash alternate outline'/></Button>}/>}
	>
		<Modal.Header>Delete collection {_name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {_name}?</Header>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<Button
				onClick={() => {
					fetch(`${servicesBaseUrl}/collectionDelete?name=${_name}`, {
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
} // DeleteCollectionModal
