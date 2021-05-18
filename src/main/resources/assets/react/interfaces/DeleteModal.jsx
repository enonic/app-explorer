import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';


export function DeleteModal({
	disabled = false,
	name,
	onClose = () => {},
	servicesBaseUrl
}) {
	const [deleteNameMatches, setDeleteNameMatches] = React.useState(false);
	const [typedInterfaceName, setTypedInterfaceName] = React.useState('');
	const [open, setOpen] = React.useState(false);
	return <Modal
		closeIcon
		onClose={() => {
			setOpen(false);
			onClose();
		}}
		open={open}
		trigger={<Button
			compact
			disabled={disabled}
			onClick={() => setOpen(true)}
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
								setOpen(false);
								onClose();
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
