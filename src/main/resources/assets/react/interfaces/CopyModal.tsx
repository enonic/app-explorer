import * as React from 'react';
import {
	Button,
	Icon,
	Input,
	Message,
	Modal,
	Popup,
} from 'semantic-ui-react';


export function CopyModal({
	// Required
	name,
	servicesBaseUrl,
	// Optional
	afterClose = () => {/**/},
	beforeOpen = () => {/**/},
	loading = false,
} :{
	// Required
	name :string
	servicesBaseUrl :string
	// Optional
	afterClose ?:() => void
	beforeOpen ?:() => void
	loading ?:boolean
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
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		trigger={
			<Popup
				content={`Copy interface ${name}`}
				inverted
				trigger={
					<Button
						onClick={doOpen}
						disabled={loading}
						icon
						loading={loading}
						size='tiny'
						type='button'
					><Icon color='green' name='copy'/></Button>
				}
			/>
		}
	>
		<Modal.Header>Copy</Modal.Header>
		<Modal.Content>
			<Input
				error={interfaceExists}
				onChange={(
					//@ts-ignore
					event,
					{value}
				) => {
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
			/> : null}
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<Button
				disabled={!interfaceTo || interfaceExists}
				icon
				onClick={() => {
					fetch(`${servicesBaseUrl}/interfaceCopy?from=${name}&to=${interfaceTo}`)
						.then(response => {
							if (response.status === 200) {
								doClose();
							}
						});
				}}
				primary
			><Icon name='copy'/> Copy</Button>
		</Modal.Actions>
	</Modal>;
} // function CopyModal
