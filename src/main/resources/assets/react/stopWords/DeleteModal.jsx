import {Button, Form, Header, Icon, Modal, Popup} from 'semantic-ui-react';


export function DeleteModal(props) {
	const {
		afterClose,
		name,
		servicesBaseUrl
	} = props;

	const [open, setOpen] = React.useState(false);

	function onClose() {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	return <Modal
		closeIcon
		onClose={onClose}
		open={open}
		trigger={<Popup
			content={`Open dialog to confirm deletion of stop words list ${name}`}
			inverted
			trigger={<Button
				icon
				onClick={() => setOpen(true)}
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
							.then(response => {
								//if (response.status === 200) {
								onClose();
								//}
							})
					}}
				><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
			</Form>
		</Modal.Content>
	</Modal>;
} // DeleteModal
