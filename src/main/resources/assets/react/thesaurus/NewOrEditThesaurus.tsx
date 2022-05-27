import type {
	Locales,
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';
import type {NewOrEditState} from './index.d';


import {Button, Form, Header, Icon, Label, Modal} from 'semantic-ui-react';
import {
	Form as EnonicForm,
	Input as EnonicInput,
	ResetButton,
	SubmitButton
} from '@enonic/semantic-ui-react-form';
import {LanguageDropdown} from '../collection/LanguageDropdown';
//import {EditSynonyms} from './EditSynonyms';
import {UploadLicense} from '../UploadLicense';
import {mustStartWithALowercaseLetter} from '../utils/mustStartWithALowercaseLetter';
import {notDoubleUnderscore} from '../utils/notDoubleUnderscore';
import {onlyLowercaseAsciiLettersDigitsAndUnderscores} from '../utils/onlyLowercaseAsciiLettersDigitsAndUnderscores';
import {required} from '../utils/required';
import {NEW_OR_EDIT_STATE_DEFAULT} from './useThesauriState';


const GQL_MUTATION_THESAURUS_CREATE = `mutation CreateThesaurusMutation(
  $_name: String!,
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


export function NewOrEditThesaurus(props :{
	// Required
	licenseValid :boolean
	locales :Locales
	open :boolean
	servicesBaseUrl :string
	setNewOrEditState :React.Dispatch<React.SetStateAction<NewOrEditState>>
	setLicensedTo :SetLicensedToFunction
	setLicenseValid :SetLicenseValidFunction
	thesaurusNames :Array<string>
	// Optional
	_id ?:string
	_name ?:string
	afterClose ?:() => void
	language ?:{
		from :string
		to :string
	}
}) {
	const {
		// Required
		licenseValid,
		locales,
		open,
		servicesBaseUrl,
		setNewOrEditState,
		setLicensedTo,
		setLicenseValid,
		thesaurusNames,
		// Optional
		_id,
		_name = '',
		afterClose = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
		language = {
			from: '',
			to: ''
		}
	} = props;
	//console.debug('NewOrEditThesaurus _id', _id);
	//console.debug('NewOrEditThesaurus licenseValid', licenseValid);
	//console.debug('NewOrEditThesaurus _name', _name);

	function doClose() {
		setNewOrEditState(NEW_OR_EDIT_STATE_DEFAULT);
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	function mustBeUnique(v :string) {
		if (thesaurusNames.includes(v)) {
			return `Name must be unique: Name '${v}' is already in use!`;
		}
	}

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
	>{licenseValid
			? <>
				<Modal.Header>{_id ? `Edit thesaurus ${_name}` : 'New thesaurus'}</Modal.Header>
				<EnonicForm
					initialValues={{
						language,
						_name
					}}
					onSubmit={(values :{
						_name :string
						language :{
							from :string
							to :string
						}
					}) => {
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
							from: (value :string) => required(value),
							to: (value :string) => required(value)
						},
						_name: (v :string) => _id ? false : required(v)
							|| mustStartWithALowercaseLetter(v)
							|| onlyLowercaseAsciiLettersDigitsAndUnderscores(v)
							|| notDoubleUnderscore(v)
							|| mustBeUnique(v)
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
