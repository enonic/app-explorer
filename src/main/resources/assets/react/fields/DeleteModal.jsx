import {
	Button, Header, Icon, Modal, Popup
} from 'semantic-ui-react';

import{GQL_MUTATION_FIELD_DELETE} from '../../../services/graphQL/field/mutationFieldDelete';

export function DeleteModal(props) {
	const {
		_id,
		_name,
		disabled,
		onClose,
		popupContent,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);
	return <Modal
		closeIcon
		onClose={onClose}
		open={open}
		trigger={<Popup
			content={popupContent}
			trigger={<div style={{ display: "inline-block" }}>
				<Button
				icon
				disabled={disabled}
					onClick={() => setOpen(true)}>
					<Icon color='red' name='trash alternate outline'/>
				</Button>
			</div>
			}/>}
	>
		<Modal.Header>Delete field {_name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {_name}?</Header>
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/graphQL`, {
						method: 'POST',
						headers: {
							'Content-Type':	'application/json'
						},
						body: JSON.stringify({
							query: GQL_MUTATION_FIELD_DELETE,
							variables: {
								_id
							}
						})
					}).then((/*response*/) => {
						//if (response.status === 200) {}
						setOpen(false); // This needs to be before unmount.
						onClose(); // This could trigger render in parent, and unmount this Component.
					});
				}}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteModal
