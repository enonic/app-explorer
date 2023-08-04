import * as React from 'react';
import {
	Button,
	Header,
	Icon,
	Message,
	Modal,
} from 'semantic-ui-react';
import useDeleteCollectionState from './useDeleteCollectionState';


export function DeleteCollectionModal({
	collectionId,
	collectionName,
	onClose,
}: {
	collectionId: string
	collectionName: string
	onClose: () => void
}) {
	const {
		fetchDeleteCollectionAndClose,
		loading,
		loadingDeleteCollection,
		usedInInterfaces,
	} = useDeleteCollectionState({
		collectionId,
		onClose
	});

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={onClose}
		open
		size='small'
	>
		<Modal.Header>Delete collection {collectionName}</Modal.Header>
		<Modal.Content>
			{
				loading
					? <Message
						icon
						warning
					>
						<Icon name='circle notched' loading/>
						Checking interfaces...
					</Message>
					: usedInInterfaces.length
						? <Message
							icon='warning sign'
							header={`The collection is used by the following interface${usedInInterfaces.length > 1 ? 's' : ''}:`}
							list={usedInInterfaces}
							negative
						/>
						: <Message
							icon='check'
							header='The collection is not used in any interfaces'
							success
						/>
			}
			{
				loading
					? null
					: <Header as='h2'>Do you{usedInInterfaces.length ? ' really' : ''} want to delete {collectionName}?</Header>
			}
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={onClose}>Cancel</Button>
			<Button
				icon
				disabled={loading || loadingDeleteCollection}
				onClick={fetchDeleteCollectionAndClose}
				primary
			><Icon name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Actions>
	</Modal>;
} // DeleteCollectionModal
