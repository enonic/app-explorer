import {
	Button, Form, Header, Icon, Label, Modal, Popup
} from 'semantic-ui-react';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Input as EnonicInput} from 'semantic-ui-react-form/inputs/Input';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';

import {LanguageDropdown} from '../collection/LanguageDropdown';
//import {EditSynonyms} from './EditSynonyms';
import {UploadLicense} from '../UploadLicense';


const GQL_MUTATION_THESAURUS_CREATE = `mutation CreateThesaurusMutation(
  $_name: ID!,
  $language: ThesaurusLanguageInput!
) {
  createThesaurus(
    _name: $_name,
    language: $language
  ) {
    _id
    _name
    _nodeType
    _path
    language {
      from
      to
    }
  }
}`;

const GQL_MUTATION_THESAURUS_UPDATE = `mutation UpdateThesaurusMutation(
  $_id: ID!,
  $_name: String!,
  $language: ThesaurusLanguageInput!
) {
  updateThesaurus(
    _id: $_id,
    _name: $_name,
    language: $language
  ) {
    _id
    _name
    _nodeType
    _path
    language {
      from
      to
    }
  }
}`;


function required(value) {
	return value ? undefined : 'Required!';
}


export function NewOrEditThesaurus(props) {
	const {
		_id,
		afterClose = () => {},
		beforeOpen = () => {},
		language = {
			from: '',
			to: ''
		},
		licenseValid,
		locales,
		_name = '',
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid
	} = props;
	//console.debug('NewOrEditThesaurus _id', _id);
	//console.debug('NewOrEditThesaurus licenseValid', licenseValid);
	//console.debug('NewOrEditThesaurus _name', _name);

	const [open, setOpen] = React.useState(false);

	// Made doOpen since onOpen doesn't get called consistently.
	function doOpen() {
		beforeOpen();
		setOpen(true);
	}

	function doClose() {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		trigger={_id ? <Popup
			content={`Edit thesaurus ${_name}`}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='options'/></Button>}
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
				<Modal.Header>{_id ? `Edit thesaurus ${_name}` : 'New thesaurus'}</Modal.Header>
				<EnonicForm
					initialValues={{
						language,
						_name
					}}
					onSubmit={(values) => {
						//console.debug('onSubmit values', values);
						const {
							_name: newName,
							language: newLanguage
						} = values;
						//console.debug('onSubmit newName', newName);
						//console.debug('onSubmit newLanguage', newLanguage);
						fetch(`${servicesBaseUrl}/graphQL`, {
							method: 'POST',
							headers: {
								'Content-Type':	'application/json'
							},
							body: JSON.stringify({
								query: _id ? GQL_MUTATION_THESAURUS_UPDATE : GQL_MUTATION_THESAURUS_CREATE,
								variables: {
									_id,
									_name: newName, // Support rename...
									language: newLanguage
								}
							})
						}).then((response) => {
							if (response.status === 200) {doClose();}
							//doClose();
						});
					}}
					schema={{
						language: {
							from: (value) => required(value),
							to: (value) => required(value)
						},
						_name: (value) => required(value)
					}}
				>
					<Modal.Content>
						<Form as='div'>
							{!_id && <Form.Field>
								<EnonicInput
									fluid
									label={{basic: true, content: 'Name'}}
									path='_name'
									placeholder='Please input name'
								/>
							</Form.Field>}
							<Form.Field>
								<Header as='h3' content='Language'/>
								<Label content='From' size='large'/>
								<LanguageDropdown locales={locales} parentPath='language' name='from'/>
								<Label content='To' size='large'/>
								<LanguageDropdown locales={locales} parentPath='language' name='to'/>
							</Form.Field>
						</Form>
						{/*_id && <>
							<Header as='h2' content='Synonyms'/>
							<EditSynonyms
								locales={locales}
								servicesBaseUrl={servicesBaseUrl}
								thesaurusId={_id}
								thesaurusName={_name}
							/>
						</>*/}
					</Modal.Content>
					<Modal.Actions>
						<Button onClick={doClose}>Cancel</Button>
						<ResetButton secondary/>
						<SubmitButton primary><Icon name='save'/>Save</SubmitButton>
					</Modal.Actions>
				</EnonicForm>
			</>
			: <UploadLicense
				servicesBaseUrl={servicesBaseUrl}
				setLicensedTo={setLicensedTo}
				setLicenseValid={setLicenseValid}
			/>
		}</Modal>;
} // NewOrEditThesaurus
