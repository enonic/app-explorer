import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';


export function DeleteModal({
	afterClose = () => {},
	beforeOpen = () => {},
	disabled = false,
	name,
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
		<Modal.Header>Delete</Modal.Header>
		<Modal.Content>
			<Input
				error={!deleteNameMatches}
				onChange={(event, {value}) => {
					//console.debug({name, value});
					setDeleteNameMatches(name === value);
					setTypedInterfaceName(value);
				}}
				placeholder='Please input name'
				value={typedInterfaceName}
			/>
			{deleteNameMatches ? <Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/interfaceDelete?name=${name}`, {
						method: 'POST'
					})
						.then(response => {
							if (response.status === 200) {
								doClose();
							}
						});
				}}
				type='button'
			><Icon color='red' name='trash alternate outline'/>Delete</Button> : <Message
				icon='warning sign'
				header='Error'
				content="Name doesn't match!"
				negative
			/>}
		</Modal.Content>
	</Modal>;
} // function DeleteModal
