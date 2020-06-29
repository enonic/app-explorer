import {
	Button, Form, Header, Icon, Input, Modal, Popup
} from 'semantic-ui-react';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Input as EnonicInput} from 'semantic-ui-react-form/inputs/Input';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';

import {EditSynonyms} from './EditSynonyms';
import {UploadLicense} from '../UploadLicense';

function required(value) {
	return value ? undefined : 'Required!';
}


export function NewOrEditThesaurus(props) {
	const {
		id,
		displayName = '',
		licenseValid,
		name = '',
		onClose,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid
	} = props;
	//console.debug('NewOrEditThesaurus licenseValid', licenseValid);

	const [open, setOpen] = React.useState(false);

	function doOpen() { setOpen(true); }

	function doClose() {
		setOpen(false); // This needs to be before unmount.
		onClose(); // This could trigger render in parent, and unmount this Component.
	}

	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={id ? <Popup
			content={`Edit thesaurus ${displayName}`}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='edit'/></Button>}
		/>
			: <Button
				circular
				color='green'
				icon
				onClick={doOpen}
				size='massive'
				style={{
					bottom: 13.5,
					position: 'fixed',
					right: 13.5
				}}><Icon
					name='plus'
				/></Button>}
	>{licenseValid
			? <>
				<Modal.Header>{id ? `Edit thesaurus ${displayName}` : 'New thesaurus'}</Modal.Header>
				<Modal.Content>
					<EnonicForm
						initialValues={{
							name,
							displayName
						}}
						onSubmit={({
							name,
							displayName
						}) => {
							fetch(`${servicesBaseUrl}/thesaurus${id ? 'Update' : 'Create'}?displayName=${displayName}${id ? `&id=${id}` : ''}&name=${name}`, {
								method: 'POST'
							}).then(response => {
								doClose();
							})
						}}
						schema={{
							displayName: (value) => required(value),
							name: (value) => required(value)
						}}
					>
						<Form as='div'>
							{!id && <Form.Field>
								<EnonicInput
									fluid
									label={{basic: true, content: 'Name'}}
									path='name'
									placeholder='Please input name'
								/>
							</Form.Field>}
							<Form.Field>
								<EnonicInput
									fluid
									label={{basic: true, content: 'Display name'}}
									path='displayName'
									placeholder='Please input display name'
								/>
							</Form.Field>
							<Form.Field>
								<SubmitButton/>
								<ResetButton/>
							</Form.Field>
						</Form>
					</EnonicForm>
					{id && <>
						<Header as='h2' content='Synonyms'/>
						<EditSynonyms
							servicesBaseUrl={servicesBaseUrl}
							thesaurusId={id}
							thesaurusName={name}
						/>
					</>}
				</Modal.Content>
			</>
			: <UploadLicense
				servicesBaseUrl={servicesBaseUrl}
				setLicensedTo={setLicensedTo}
				setLicenseValid={setLicenseValid}
			/>
		}</Modal>;
} // NewOrEditThesaurus
