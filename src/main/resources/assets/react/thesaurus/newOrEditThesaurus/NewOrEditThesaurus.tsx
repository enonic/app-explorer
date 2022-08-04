import type {JSONResponse}  from '../../../../services/graphQL/fetchers/index.d';
import type {
	Locales,
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../../index.d';
import type {NewOrEditState} from '../index.d';


import * as gql from 'gql-query-builder';
import {Button, Form, Header, Modal, Segment} from 'semantic-ui-react';
import {LanguageDropdown} from '../../collection/LanguageDropdown';
import {ResetButton} from '../../components/ResetButton';
import {SubmitButton} from '../../components/SubmitButton';
import {UploadLicense} from '../../UploadLicense';
import {NEW_OR_EDIT_STATE_DEFAULT} from '../useThesauriState';
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
		fromLanguage,
		isStateChanged,
		languages,
		loading,
		migrateTaskId,
		name,
		nameError,
		nameOnBlur,
		nameOnChange,
		onSubmit,
		resetState,
		setFromLanguage,
		setLanguages,
		setLoading,
		setMigrateTaskId,
		setToLanguage,
		toLanguage
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
							? <Segment>
								<Header as='h2' content='Migration'/>
								<Form.Field>
									<label>From Language</label>
									<LanguageDropdown
										disabled={loading}
										includeANoneOption={false}
										language={fromLanguage}
										loading={loading}
										locales={locales.filter(({tag}) => languages.includes(tag))}
										multiple={false}
										setLanguage={(language) => setFromLanguage(language as string)}
									/>
								</Form.Field>
								<Form.Field>
									<label>To Language</label>
									<LanguageDropdown
										disabled={loading}
										includeANoneOption={false}
										language={toLanguage}
										loading={loading}
										locales={locales.filter(({tag}) => languages.includes(tag))}
										multiple={false}
										setLanguage={(language) => setToLanguage(language as string)}
									/>
								</Form.Field>
								<Button
									content={'Migrate x synonyms'}
									disabled={!fromLanguage || !toLanguage}
									icon={{name: 'tasks'}}
									onClick={() => {
										setLoading(true);
										fetch(`${servicesBaseUrl}/graphQL`, {
											method: 'POST',
											headers: {
												'Content-Type':	'application/json'
											},
											body: JSON.stringify(gql.mutation({
												operation: 'migrateThesaurusSynonyms_v1_to_v2',
												fields: [
													'taskId'
												],
												variables: {
													fromLocale: {
														required: true,
														type: 'String',
														value: fromLanguage
													},
													thesaurusId: {
														required: true,
														type: 'ID',
														value: _id
													},
													toLocale: {
														required: true,
														type: 'String',
														value: toLanguage
													}
												}
											}))
										})
											.then(res => res.json() as JSONResponse<{migrateThesaurusSynonyms_v1_to_v2 :{
												taskId :string
											}}>)
											.then(({
												data: {
													migrateThesaurusSynonyms_v1_to_v2: {
														taskId
													}
												}
											}) => {
												console.debug('taskId', taskId);
												setMigrateTaskId(taskId);
												setLoading(false);
											});
									}}
								/>
							</Segment>
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
