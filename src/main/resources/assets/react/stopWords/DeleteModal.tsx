import * as React from 'react';
import {Button, Header, Icon, Modal, Popup} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';
import {fetchStopWordsDelete} from '../../../services/graphQL/fetchers/fetchStopWordsDelete';


export function DeleteModal(props :{
	// Required
	_id :string
	_name :string
	servicesBaseUrl :string
	// Optional
	afterClose? :() => void
	beforeOpen? :() => void
	disabled ?:boolean
	loading ?:boolean
}) {
	const {
		// Required
		_id,
		_name,
		servicesBaseUrl,
		// Optional
		afterClose = () => {/**/},
		beforeOpen = () => {/**/},
		disabled = false,
		loading = false
	} = props;

	const [open, setOpen] = React.useState(false);

	function doClose() {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

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
				content={`Open dialog to confirm deletion of stop words list ${_name}`}
				inverted
				trigger={
					<HoverButton
						color='red'
						disabled={disabled}
						icon='trash alternate outline'
						loading={loading}
						onClick={doOpen}
					/>}
			/>
		}
	>
		<Modal.Header>Delete {_name}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {_name}?</Header>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<Button
				icon
				onClick={() => {
					fetchStopWordsDelete({
						handleResponse: (/*response*/) => {
							//if (response.status === 200) {
							doClose();
							//}
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
} // DeleteModal
