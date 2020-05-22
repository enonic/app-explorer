import {
	Button, Form, Icon, Input, Modal
} from 'semantic-ui-react';


export const UploadLicense = (props) => {
	const {
		servicesBaseUrl,
		setLicenseValid
	} = props;
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
							setLicenseValid(true);
						}
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
