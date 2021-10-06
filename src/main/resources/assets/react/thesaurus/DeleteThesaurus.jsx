import {Button, Header, Icon, Modal, Popup} from 'semantic-ui-react';


const GQL_MUTATION_THESAURUS_DELETE = `mutation DeleteThesaurusMutation(
  $_id: ID!
) {
  deleteThesaurus(
    _id: $_id
  ) {
    _id
  }
}`;


export function DeleteThesaurus(props) {
	const {
		_id,
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
			content={`Delete thesaurus ${name}`}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
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
