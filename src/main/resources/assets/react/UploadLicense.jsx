import {
	Button, Form, Icon, Input, Modal
} from 'semantic-ui-react';


export const UploadLicense = (props) => {
	const {servicesBaseUrl} = props;
	const [file, setFile] = React.useState();
	return <>
		<Modal.Header>Upload license</Modal.Header>
		<Modal.Content>
			<Form onSubmit={(event) => {
				event.preventDefault(); // Stop form submit
				//console.debug(event, file);
				const formData = new FormData();
				formData.append('license', file);
				fetch(`${servicesBaseUrl}/uploadLicense`, {
					body: formData,
					'Content-type': 'multipart/form-data',
					method: 'POST'
				}).then(response => {
					console.debug(response);
					// TODO Handle response
				});
			}}>
				<Form.Field>
					<Input
						onChange={(event) => {
							//console.debug(event);
							setFile(event.target.files[0]);
						}}
						type='file'
					/>
				</Form.Field>
				<Button icon type='submit'><Icon name='upload'/></Button>
			</Form>
		</Modal.Content>
	</>;
}
