import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';

import {fetchInterfaceDelete} from '../../../services/graphql/fetchers/fetchInterfaceDelete.mjs';


export function DeleteModal({
	_id,
	_name,
	afterClose = () => {},
	beforeOpen = () => {},
	disabled = false,
	servicesBaseUrl
}) {
	const [deleteNameMatches, setDeleteNameMatches] = React.useState(false);
	const [typedInterfaceName, setTypedInterfaceName] = React.useState('');
	const [open, setOpen] = React.useState(false);

	const doClose = () => {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
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
		trigger={<Button
			compact
			disabled={disabled}
			onClick={doOpen}
			size='tiny'
			type='button'
		><Icon color='red' name='trash alternate outline'/>Delete</Button>}
	>
		<Modal.Header>Delete interface {_name}</Modal.Header>
		<Modal.Content>
			<Input
				error={!deleteNameMatches}
				onChange={(event, {value}) => {
					//console.debug({name, value});
					setDeleteNameMatches(_name === value);
					setTypedInterfaceName(value);
				}}
				placeholder='Please input name'
				value={typedInterfaceName}
			/>
			{deleteNameMatches ? null :<Message
				icon='warning sign'
				header='Error'
				content="Name doesn't match!"
				negative
			/>}
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<Button
				disabled={!deleteNameMatches}
				onClick={() => {
					fetchInterfaceDelete({
						handleResponse: (response) => {
							if (response.status === 200) {
								doClose();
							}
						},
						url: `${servicesBaseUrl}/graphQL`,
						variables: {
							_id
						}
					});
				}}
				primary
			><Icon color='white' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Actions>
	</Modal>;
} // function DeleteModal
