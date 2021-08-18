import {Button, Header, Icon, Modal, Popup} from 'semantic-ui-react';


const GQL_MUTATION_THESAURUS_DELETE = `mutation DeleteThesaurusMutation(
  $_id: String!
) {
  deleteThesaurus(
    _id: $_id
  ) {
    _id
  }
}`;


export function DeleteThesaurus(props) {
	const {
		onClose,
		_id,
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
					fetch(`${servicesBaseUrl}/graphQL`, {
						method: 'POST',
						headers: {
							'Content-Type':	'application/json'
						},
						body: JSON.stringify({
							query: GQL_MUTATION_THESAURUS_DELETE,
							variables: {
								_id
							}
						})
					}).then((response) => {
						if (response.status === 200) {doClose();}
					});
				}}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteThesaurus
