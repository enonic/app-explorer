import {
	Button, Form, Icon, Input, Message, Modal
} from 'semantic-ui-react';


export const UploadLicense = (props) => {
	const {
		servicesBaseUrl,
		setLicenseValid
	} = props;
	const [uploadedLicenseValid, setUploadedLicenseValid] = React.useState(true);
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
				}).then(response => response.json())
					.then(data => {
						//console.debug(data);
						const {licenseValid} = data;
						//console.debug(licenseValid);
						if (licenseValid) {
							setUploadedLicenseValid(true);
							setLicenseValid(true);
						} else {
							setUploadedLicenseValid(false);
						}
					});
			}}>
				<Form.Field>
					{uploadedLicenseValid ? null : <Message icon negative>
						<Icon name='warning sign'/>
						<Message.Content>Uploaded license invalid, please try again.</Message.Content>
					</Message>}
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
