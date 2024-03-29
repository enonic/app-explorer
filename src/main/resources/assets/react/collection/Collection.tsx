import type {CollectionFormValues} from '@enonic-types/lib-explorer';
import type {
	ContentTypeOptions,
	Fields,
	SiteOptions
} from '@enonic-types/lib-explorer/Collector.d';
import type {
	CollectorComponents,
	Locales
} from '../index.d';
import type {
	DropdownItemsWithKeys,
	QueryCollectionsHits
} from './index.d';


import {
	Button,
	Form,
	Header,
	Modal,
	Segment
} from 'semantic-ui-react';
import {ResetButton} from '../components/ResetButton';
import {SubmitButton} from '../components/SubmitButton';
import {CollectorOptions} from './CollectorOptions';
import {CollectorSelector} from './CollectorSelector';
import {LanguageDropdown} from './LanguageDropdown';
import {SchedulingSegment} from './SchedulingSegment';
import {DocumentTypeSelector} from './DocumentTypeSelector';
import {useCollectionState} from './useCollectionState';


export function Collection({
	// Required
	initialValues,
	collections,
	collectorComponents,
	collectorOptions,
	contentTypeOptions,
	doClose,
	locales, // []
	servicesBaseUrl,
	siteOptions,
	// Optional
	fields = {},
} :{
	// Required
	collections :QueryCollectionsHits
	collectorComponents :CollectorComponents
	collectorOptions :DropdownItemsWithKeys<string>
	contentTypeOptions :ContentTypeOptions
	doClose :() => void
	locales :Locales
	initialValues :CollectionFormValues
	servicesBaseUrl :string
	siteOptions :SiteOptions
	// Optional
	fields ?:Fields
}) {
	const {
		collectorComponentRef,
		collectorConfig,
		collectorName,
		cronArray,
		doCollect,
		documentTypeId,
		errorCount,
		initialCollectorConfig,
		isStateChanged,
		language,
		loading,
		managedDocumentTypes,
		name,
		nameError,
		nameOnBlur,
		nameOnChange,
		onSubmit,
		resetState,
		setCollectorConfig,
		setCollectorConfigErrorCount,
		setCollectorName,
		setCronArray,
		setDoCollect,
		setDocumentTypeId,
		setLanguage
	} = useCollectionState({
		collections,
		doClose,
		initialValues,
		servicesBaseUrl
	});

	return <>
		<Modal.Content>
			<Segment
				disabled={loading}
			>
				<Header as='h1' dividing content='Collection' id='collection'/>
				<Form>
					{
						initialValues._name
							? null
							: <Form.Input
								error={nameError}
								fluid
								label='Name'
								onBlur={() => nameOnBlur(name)}
								onChange={nameOnChange}
								placeholder='Please input a unique name'
								value={name}
							/>
					}
					<Form.Field>
						<label>Default language</label>
						<LanguageDropdown
							includeANoneOption={true}
							locales={locales}
							language={language}
							placeholder='Please select default language'
							setLanguage={(l) => setLanguage(l as string)}
						/>
					</Form.Field>
				</Form>
			</Segment>
			<Segment
				disabled={loading}
			>
				<Form>
					<Header as='h2' dividing content='Collector'/>
					<CollectorSelector
						collectorName={collectorName}
						options={collectorOptions}
						setCollectorName={setCollectorName}
					/>
					{
						managedDocumentTypes
							? <>
								<Header as='h5' content='Managed document type(s)'/>
								<ul style={{
									listStyleType: 'none',
									margin: 0,
									padding: 0
								}}>
									{managedDocumentTypes.map((documentTypeName, i) => <li key={i}>{documentTypeName}</li>)}
								</ul>
							</>
							: collectorName
								? <DocumentTypeSelector
									documentTypeId={documentTypeId}
									servicesBaseUrl={servicesBaseUrl}
									setDocumentTypeId={setDocumentTypeId}
								/>
								: null
					}
				</Form>
				<CollectorOptions
					collectorComponentRef={collectorComponentRef}
					collectorComponents={collectorComponents}
					collectorConfig={collectorConfig}
					collectorName={collectorName}
					contentTypeOptions={contentTypeOptions}
					fields={fields}
					initialCollectorConfig={initialCollectorConfig}
					loading={loading}
					siteOptions={siteOptions}
					setCollectorConfig={setCollectorConfig}
					setCollectorConfigErrorCount={setCollectorConfigErrorCount}
				/>
			</Segment>
			{(collectorName && collectorName !== '_none')
				? <SchedulingSegment
					cronArray={cronArray}
					doCollect={doCollect}
					loading={loading}
					setCronArray={setCronArray}
					setDoCollect={setDoCollect}
				/>
				: null
			}
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
				loading={loading}
				onClick={onSubmit}
				isStateChanged={isStateChanged}
				primary
			/>
		</Modal.Actions>
	</>;
} // function Collection
