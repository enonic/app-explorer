import {Button, Header, Icon, Modal} from 'semantic-ui-react';


export function DeleteThesaurus(props) {
	const {
		onClose,
		id,
		name,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);
	function doOpen() { setOpen(true); }
	function doClose() {
		onClose();
		setOpen(false);
	}
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={<Button
			compact
			onClick={() => setOpen(true)}
			size='tiny'><Icon color='red' name='trash alternate outline'/>Delete thesaurus</Button>}
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
