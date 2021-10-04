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
		onClose={doClose}
		open={state.open}
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
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/collectionDelete?name=${_name}`, {
						method: 'DELETE'
					}).then((/*response*/) => {
						//if (response.status === 200) {}
						doClose();
					});
				}}
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteCollectionModal
