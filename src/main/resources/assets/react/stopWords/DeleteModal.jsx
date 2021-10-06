import {Button, Form, Header, Icon, Modal, Popup} from 'semantic-ui-react';


export function DeleteModal(props) {
	const {
		afterClose = () => {},
		beforeOpen = () => {},
		name,
		servicesBaseUrl
	} = props;

	const [open, setOpen] = React.useState(false);

	function doClose() {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setOpen(true);
	};

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		trigger={<Popup
			content={`Open dialog to confirm deletion of stop words list ${name}`}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='red' name='trash alternate outline'/></Button>}/>}
	>
		<Modal.Header>Delete {name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {name}?</Header>
			<Form>
				<Button
					onClick={() => {
						fetch(`${servicesBaseUrl}/stopWordsDelete?name=${name}`, {
							method: 'DELETE'
						})
							.then((/*response*/) => {
								//if (response.status === 200) {
								doClose();
								//}
							});
					}}
				><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
			</Form>
		</Modal.Content>
	</Modal>;
} // DeleteModal
