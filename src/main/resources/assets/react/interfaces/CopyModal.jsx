import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';


export function CopyModal({
	afterClose = () => {},
	beforeOpen = () => {},
	name,
	servicesBaseUrl
}) {
	const [interfaceExists, setInterfaceExists] = React.useState(false);
	const [interfaceTo, setInterfaceTo] = React.useState('');
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
		trigger={<Button onClick={doOpen} compact size='tiny' type='button'><Icon color='green' name='copy'/>Copy</Button>}
	>
		<Modal.Header>Copy</Modal.Header>
		<Modal.Content>
			<Input
				error={interfaceExists}
				onChange={(event, {value}) => {
					fetch(`${servicesBaseUrl}/interfaceExists?name=${value}`)
						.then(response => response.json())
						.then(({exists}) => {
							//console.debug(exists);
							setInterfaceExists(exists);
							setInterfaceTo(value);
						});
				}}
				placeholder='Please input name'
			/>
			{interfaceExists ? <Message
				icon='warning sign'
				header='Error'
				content='Interface name already in use!'
				negative
			/> : <Button
				onClick={() => {
					fetch(`${servicesBaseUrl}/interfaceCopy?from=${name}&to=${interfaceTo}`)
						.then(response => {
							if (response.status === 200) {
								doClose();
							}
						});
				}}
				type='button'
			><Icon color='green' name='copy'/>Copy</Button>}
		</Modal.Content>
	</Modal>;
} // function CopyModal
