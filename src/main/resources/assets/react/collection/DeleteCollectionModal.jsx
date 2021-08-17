import {Button, Header, Icon, Modal, Popup} from 'semantic-ui-react';

export function DeleteCollectionModal(props) {
	const {
		_name,
		disabled = false,
		onClose,
		onOpen = () => {},
		servicesBaseUrl
	} = props;
	const [state, setState] = React.useState({
		open: false
	});
	//console.debug('DeleteModal', {props, state});

	return <Modal
		closeIcon
		onClose={() => setState({open: false})}
		onOpen={onOpen}
		open={state.open}
		trigger={<Popup
			content={`Delete collection ${_name}`}
			inverted
			trigger={<Button
				disabled={disabled}
				icon
				onClick={() => setState({open: true})}><Icon color='red' name='trash alternate outline'/></Button>}/>}
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
						setState({open: false});
						onClose();
					});
				}}
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteCollectionModal
