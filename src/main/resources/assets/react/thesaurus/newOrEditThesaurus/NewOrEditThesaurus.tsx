import type {
	Locales,
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../../index.d';
import type {NewOrEditState} from '../index.d';


import {Button, Form, Modal} from 'semantic-ui-react';
import {LanguageDropdown} from '../../collection/LanguageDropdown';
import {ResetButton} from '../../components/ResetButton';
import {SubmitButton} from '../../components/SubmitButton';
import {UploadLicense} from '../../components/UploadLicense';
import {NEW_OR_EDIT_STATE_DEFAULT} from '../useThesauriState';
import {MigrationSegment} from './MigrationSegment';
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
}) {
	function doClose() {
		setNewOrEditState(NEW_OR_EDIT_STATE_DEFAULT);
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	const {
		errorCount,
		isStateChanged,
		languages,
		loading,
		name,
		nameError,
		nameOnBlur,
		nameOnChange,
		onSubmit,
		resetState,
		setLanguages,
		setLoading
	} = useNewOrEditThesaurusState({
		_id,
		doClose,
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
							<label>Languages</label>
							<LanguageDropdown
								disabled={loading}
								includeANoneOption={false}
								language={languages}
								loading={loading}
								locales={locales}
								multiple={true}
								setLanguage={(languages) => setLanguages(languages as Array<string>)}
							/>
						</Form.Field>
						{_id
							? <MigrationSegment
								languages={languages}
								loading={loading}
								locales={locales}
								servicesBaseUrl={servicesBaseUrl}
								setLoading={setLoading}
								thesaurusId={_id}
								thesaurusName={_name}
							/>
							: null
						}
					</Form>
				</Modal.Content>
				<Modal.Actions>
					<Button
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
