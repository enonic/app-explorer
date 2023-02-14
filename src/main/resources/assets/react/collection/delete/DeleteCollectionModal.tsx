import * as React from 'react';
import {
	Button,
	Header,
	Icon,
	Message,
	Modal,
	Popup,
} from 'semantic-ui-react';
import useDeleteCollectionState from './useDeleteCollectionState';


export function DeleteCollectionModal({
	collectionId,
	collectionName,
	servicesBaseUrl,
	afterClose = () => {/**/},
	beforeOpen = () => {/**/},
	disabled = false,
}: {
	collectionId: string
	collectionName: string
	servicesBaseUrl: string
	afterClose?: () => void
	beforeOpen?: () => void
	disabled?: boolean
}) {
	const {
		open, setOpen,
		usedInInterfaces,
	} = useDeleteCollectionState({
		collectionId,
	});

	const doClose = () => {
		setOpen(false);
		afterClose();
	};

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
		size='small'
		trigger={<Popup
			content={`Delete collection ${collectionName}`}
			inverted
			trigger={<Button
				disabled={disabled}
				icon
				onClick={doOpen}><Icon color='red' name='trash alternate outline'/></Button>}/>}
	>
		<Modal.Header>Delete collection {collectionName}</Modal.Header>
		<Modal.Content>
			{
				usedInInterfaces.length
					? <Message
						icon='warning sign'
						header={`The collection is used by the following interface${usedInInterfaces.length > 1 ? 's' : ''}:`}
						list={usedInInterfaces}
						negative
					/>
					: null
			}
			<Header as='h2'>Do you really want to delete {collectionName}?</Header>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<Button
				icon
				onClick={() => {
					fetch(`${servicesBaseUrl}/collectionDelete?name=${collectionName}`, {
						method: 'DELETE'
					}).then((/*response*/) => {
						//if (response.status === 200) {}
						doClose();
					});
				}}
				primary
			><Icon name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Actions>
	</Modal>;
} // DeleteCollectionModal
