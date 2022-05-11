//import * as React from 'react';
import {Button, Icon, Modal} from 'semantic-ui-react';


export function EditManagedDocumentTypeWarningModal({
	documentTypeName,
	managedBy,
	onCancel = () => {/**/},
	onClose = () => {/**/},
	onConfirm = () => {/**/},
	open
} :{
	documentTypeName :string
	managedBy :string
	open :boolean
	onCancel ?:() => void
	onClose ?:() => void
	onConfirm ?:() => void
}) {

	return <Modal
		basic
		closeIcon
		closeOnDimmerClick={false}
		closeOnEscape={true}
		dimmer='blurring'
		onClose={onClose}
		open={open}
		size='tiny'
	>
		<Modal.Header>The &quot;{documentTypeName}&quot; documentType is managed</Modal.Header>
		<Modal.Content>
			<p>The &quot;{documentTypeName}&quot; documentType is managed by the &quot;{managedBy}&quot; application.</p>
			<p>Are you sure you want to edit it?</p>
		</Modal.Content>
		<Modal.Actions>
			<Button basic color='red' inverted onClick={onCancel}>
				<Icon name='remove' /> No
			</Button>
			<Button color='green' inverted onClick={onConfirm}>
				<Icon name='checkmark' /> Yes
			</Button>
		</Modal.Actions>
	</Modal>;
}
