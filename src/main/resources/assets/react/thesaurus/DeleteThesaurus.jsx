import {Button, Header, Icon, Modal, Popup} from 'semantic-ui-react';


export function DeleteThesaurus(props) {
	const {
		onClose,
		id,
		name,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);
	function doClose() {
		setOpen(false); // This needs to be before unmount.
		onClose(); // This could trigger render in parent, and unmount this Component.
	}
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={<Popup
			content={`Delete thesaurus ${name}`}
			inverted
			trigger={<Button
				icon
				onClick={() => setOpen(true)}
			><Icon color='red' name='trash alternate outline'/></Button>}/>}
	>
		<Modal.Header>Delete thesaurus {name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {name}?</Header>
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/thesaurusDelete?id=${id}&name=${name}`, {
						method: 'DELETE'
					}).then(response => {
						doClose();
					})
				}}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteThesaurus
