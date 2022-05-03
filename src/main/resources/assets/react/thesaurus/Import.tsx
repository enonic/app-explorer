import {
	Button, Form, Icon, Input, Modal, Popup
} from 'semantic-ui-react';


export function Import(props) {
	const {
		afterClose = () => {},
		beforeOpen = () => {},
		name,
		servicesBaseUrl
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
		trigger={<Popup
			content={`Import to thesaurus ${name}`}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='upload'/></Button>}
		/>}
	>
		<Modal.Header>Import to thesaurus {name}</Modal.Header>
		<Modal.Content>
			<Form>
				<Form.Field>
					<Input
						accept='text/csv'
						name='file'
						id='file'
						type='file'
					/>
				</Form.Field>
				<Button
					compact
					onClick={() => {
						const body = new FormData();
						const fileInput = document.querySelector('#file') ;
						//console.debug('fileInput', fileInput);
						body.append('name', name);
						body.append('file', fileInput.files[0]);
						fetch(`${servicesBaseUrl}/thesaurusImport`, {
							body,
							method: 'POST'
						}).then((/*response*/) => {
							doClose();
						});
					}}
					size='tiny'
					type='submit'
				><Icon color='green' name='upload'/>Import to thesaurus {name}</Button>
			</Form>
		</Modal.Content>
	</Modal>;
} // Import
