import {
	Button, Header, Icon, Modal, Popup
} from 'semantic-ui-react';


export function DeleteModal(props) {
	const {
		disabled,
		name,
		onClose,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);
	return <Modal
		closeIcon
		onClose={onClose}
		open={open}
		trigger={<Popup
			content={`Delete field ${name}`}
			inverted
			trigger={<Button
				icon
				disabled={disabled}
				onClick={() => setOpen(true)}><Icon color='red' name='trash alternate outline'/></Button>}/>}
	>
		<Modal.Header>Delete field {name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {name}?</Header>
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/fieldDelete?name=${name}`, {
						method: 'DELETE'
					}).then(response => {
						//if (response.status === 200) {}
						setOpen(false); // This needs to be before unmount.
						onClose(); // This could trigger render in parent, and unmount this Component.
					})
				}}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteModal
