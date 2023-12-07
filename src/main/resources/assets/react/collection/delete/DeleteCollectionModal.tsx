import * as React from 'react';
import {
	Button,
	Form,
	Header,
	Icon,
	Message,
	Modal,
	Radio,
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
		deleteRepo, setDeleteRepo,
		fetchDeleteCollectionAndClose,
		hasRepo,
		loading,
		loadingDeleteCollection,
		usedInInterfaces,
	} = useDeleteCollectionState({
		collectionId,
		collectionName,
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
				typeof hasRepo === 'undefined'
					? <Message
					icon
					warning
				>
					<Icon name='circle notched' loading/>
					Checking repos...
				</Message>
					: hasRepo
						? <>
						<Message
							attached
							icon='warning circle'
							header='The collection has a repo'
							warning
						/>
						<Form className='attached segment'>
							<Form.Radio
								label='Delete repo too?'
								checked={deleteRepo}
								onChange={(_e, {checked}) => setDeleteRepo(checked)}
								toggle
							/>
						</Form>
					</>
						: <Message
						icon='check'
						header="The collection doesn't have a repo"
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
