import type {
	Locales,
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';
import type {NewOrEditState} from './index.d';


import {Button, Form, Header, Label, Modal} from 'semantic-ui-react';
import {LanguageDropdown} from '../collection/LanguageDropdown';
//import {EditSynonyms} from './EditSynonyms';
import {UploadLicense} from '../UploadLicense';
import {ResetButton} from '../components/ResetButton';
import {SubmitButton} from '../components/SubmitButton';
import {NEW_OR_EDIT_STATE_DEFAULT} from './useThesauriState';
import {useNewOrEditThesaurusState} from './useNewOrEditThesaurusState';


export function NewOrEditThesaurus({
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
} :{
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
	function doClose() {
		setNewOrEditState(NEW_OR_EDIT_STATE_DEFAULT);
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	const {
		errorCount,
		fromLanguage,
		fromLanguageError,
		fromLanguageOnBlur,
		isStateChanged,
		loading,
		name,
		nameError,
		nameOnBlur,
		nameOnChange,
		onSubmit,
		resetState,
		setFromLanguage,
		setToLanguage,
		toLanguage,
		toLanguageError,
		toLanguageOnBlur
	} = useNewOrEditThesaurusState({
		_id,
		_name,
		doClose,
		language,
		servicesBaseUrl,
		thesaurusNames
	});

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		onMount={resetState}
		open={open}
	>{licenseValid
			? <>
				<Modal.Header>{_id ? `Edit thesaurus ${_name}` : 'New thesaurus'}</Modal.Header>
				<Modal.Content>
					<Form as='div'>
						{!_id && <Form.Input
							error={nameError}
							fluid
							label={'Name'}
							onBlur={() => nameOnBlur(name)}
							onChange={nameOnChange}
							placeholder='Please input name'
							value={name}
						/>}
						<Form.Field>
							<Header as='h3' content='Language'/>
							<label>From</label>
							<LanguageDropdown
								error={!!fromLanguageError}
								language={fromLanguage}
								locales={locales}
								onBlur={() => fromLanguageOnBlur(fromLanguage)}
								setLanguage={setFromLanguage}
							/>
							{fromLanguageError
								? <Label pointing prompt>{fromLanguageError}</Label>
								: null
							}
						</Form.Field>
						<Form.Field>
							<label>To</label>
							<LanguageDropdown
								error={!!toLanguageError}
								language={toLanguage}
								locales={locales}
								onBlur={() => toLanguageOnBlur(toLanguage)}
								setLanguage={setToLanguage}
							/>
							{toLanguageError
								? <Label pointing prompt>{toLanguageError}</Label>
								: null
							}
						</Form.Field>
					</Form>
					{/*_id && <>
						<Header as='h2' content='Synonyms'/>
						<EditSynonyms
							servicesBaseUrl={servicesBaseUrl}
							thesaurusId={_id}
							thesaurusName={_name}
						/>
					</>*/}
				</Modal.Content>
				<Modal.Actions>
					<Button
						disabled={loading}
						loading={loading}
						onClick={doClose}
					>Cancel</Button>
					<ResetButton
						disabled={loading}
						isStateChanged={isStateChanged}
						loading={loading}
						onClick={resetState}
						secondary
					/>
					<SubmitButton
						disabled={loading}
						errorCount={errorCount}
						isStateChanged={isStateChanged}
						loading={loading}
						onClick={onSubmit}
						primary
					/>
				</Modal.Actions>
			</>
			: <UploadLicense
				servicesBaseUrl={servicesBaseUrl}
				setLicensedTo={setLicensedTo}
				setLicenseValid={setLicenseValid}
			/>
		}</Modal>;
} // NewOrEditThesaurus
