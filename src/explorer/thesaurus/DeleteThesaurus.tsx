import * as React from 'react';
import {Button, Header, Icon, Modal, Popup} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';


const GQL_MUTATION_THESAURUS_DELETE = `mutation DeleteThesaurusMutation(
  $_id: ID!
) {
  deleteThesaurus(
    _id: $_id
  ) {
    _id
  }
}`;


export function DeleteThesaurus({
	// Required
	_id,
	servicesBaseUrl,
	name,
	// Optional
	afterClose = () => {/**/},
	beforeOpen = () => {/**/},
	disabled = false,
	loading = false
} :{
	// Required
	_id :string
	name :string
	servicesBaseUrl :string
	// Optional
	afterClose ?:() => void
	beforeOpen ?:() => void
	disabled ?:boolean
	loading ?:boolean
}) {
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
		trigger={
			<Popup
				content={`Delete thesaurus ${name}`}
				disabled={loading || disabled}
				loading={loading}
				inverted
				trigger={
					<HoverButton
						color='red'
						icon='trash alternate outline'
						onClick={doOpen}
					/>
				}
			/>
		}
	>
		<Modal.Header>Delete thesaurus {name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {name}?</Header>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<Button
				icon
				onClick={() => {
					fetch(`${servicesBaseUrl}/graphQL`, {
						method: 'POST',
						headers: { // HTTP/2 uses lowercase header keys
							'content-type':	'application/json'
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
				primary
			><Icon name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Actions>
	</Modal>;
} // DeleteThesaurus
