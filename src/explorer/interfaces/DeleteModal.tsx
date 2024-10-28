import * as React from 'react';
import {
	Button,
	Icon,
	Input,
	Message,
	Modal,
	Popup,
} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';
import {fetchInterfaceDelete} from '../fetchers/fetchInterfaceDelete';


export function DeleteModal({
	// Required
	_id,
	_name,
	servicesBaseUrl,
	// Optional
	afterClose = () => {/**/},
	beforeOpen = () => {/**/},
	disabled = false,
	loading = false
} :{
	// Required
	_id :string
	_name :string
	servicesBaseUrl :string
	// Optional
	afterClose ?:() => void
	beforeOpen ?:() => void
	disabled ?:boolean
	loading ?:boolean
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
		trigger={
			<Popup
				content={`Delete interface ${_name}`}
				inverted
				trigger={
					<HoverButton
						color='red'
						disabled={loading || disabled}
						icon='trash alternate outline'
						loading={loading}
						onClick={doOpen}
					/>
				}
			/>
		}
	>
		<Modal.Header>Delete interface {_name}</Modal.Header>
		<Modal.Content>
			<Input
				error={!deleteNameMatches}
				onChange={(
					//@ts-ignore
					event,
					{value}
				) => {
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
				icon
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
			><Icon name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Actions>
	</Modal>;
} // function DeleteModal
