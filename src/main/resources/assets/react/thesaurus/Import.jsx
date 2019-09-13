import {Button, Form, Header, Icon, Input, Modal} from 'semantic-ui-react';


export function Import(props) {
	const {
		name,
		onClose,
		servicesBaseUrl
	} = props;
	const [open, setOpen] = React.useState(false);
	function doClose() {
		setOpen(false); // This needs to be before unmount.
		onClose(); // This could trigger render in parent, and unmount this Component.
	}
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={<Button
			compact
			onClick={() => setOpen(true)}
			size='tiny'><Icon color='blue' name='upload'/>Import</Button>}
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
						}).then(response => {
							doClose();
						})
					}}
					size='tiny'
					type='submit'
				><Icon color='green' name='upload'/>Import to thesaurus {name}</Button>
			</Form>
		</Modal.Content>
	</Modal>;
} // Import
