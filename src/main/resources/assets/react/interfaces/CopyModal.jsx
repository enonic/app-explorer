import {Button, Icon, Input, Message, Modal} from 'semantic-ui-react';


export function CopyModal({
	name,
	servicesBaseUrl,
	updateInterfaces
}) {
	const [interfaceExists, setInterfaceExists] = React.useState(false);
	const [interfaceTo, setInterfaceTo] = React.useState('');
	const [open, setOpen] = React.useState(false);
	return <Modal
		closeIcon
		onClose={() => setOpen(false)}
		open={open}
		trigger={<Button onClick={() => setOpen(true)} compact size='tiny' type='button'><Icon color='green' name='copy'/>Copy</Button>}
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
						})
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
								updateInterfaces();
								setOpen(false);
							}
						})
				}}
				type='button'
			><Icon color='green' name='copy'/>Copy</Button>}
		</Modal.Content>
	</Modal>
} // function CopyModal
