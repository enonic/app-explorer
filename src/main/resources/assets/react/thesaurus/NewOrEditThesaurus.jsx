import {
	Button, Form, Header, Icon, Modal, Popup
} from 'semantic-ui-react';

//import {Dropdown} from 'semantic-ui-react-form';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
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
		languages = [],
		languagesOptions,
		licenseValid,
		name = '',
		onClose,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid
	} = props;
	//console.debug('NewOrEditThesaurus id', id);
	//console.debug('NewOrEditThesaurus displayName', displayName);
	//console.debug('NewOrEditThesaurus languages', languages);
	//console.debug('NewOrEditThesaurus licenseValid', licenseValid);
	//console.debug('NewOrEditThesaurus name', name);

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
							displayName,
							languages,
							name
						}}
						onSubmit={(values) => {
							//console.debug('onSubmit values', values);
							fetch(`${servicesBaseUrl}/thesaurus${id ? 'Update' : 'Create'}`, {
								method: 'POST',
								headers: {
									'Content-Type':	'application/json'
								},
								body: JSON.stringify(values)
							}).then((response) => {
								if (response.status === 200) {doClose();}
								//doClose();
							});
						}}
						schema={{
							displayName: (value) => required(value),
							//languages: (value) => required(value),
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
								<Dropdown
									multiple={true}
									options={languagesOptions}
									path='languages'
									placeholder='Select when to apply thesaurus'
									search
									selection
								/>
							</Form.Field>
							{/*value={languages}*/}
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
