import {
	Button, Header, Icon, Modal, Popup
} from 'semantic-ui-react';

import{GQL_MUTATION_FIELD_DELETE} from '../../../services/graphQL/field/mutationFieldDelete';

export function DeleteModal(props) {
	const {
		_id,
		_name,
		disabled,
		afterClose = () => {},
		beforeOpen = () => {},
		popupContent,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);

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
		trigger={<Popup
			content={popupContent}
			trigger={<div style={{ display: "inline-block" }}>
				<Button
				icon
				disabled={disabled}
					onClick={doOpen}>
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
						doClose();
					});
				}}
				size='tiny'
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
} // DeleteModal
