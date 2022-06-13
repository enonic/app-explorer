import type {DropdownItemProps} from 'semantic-ui-react/index.d';
import type {CollectionFormValues} from '/lib/explorer/types/index.d';
import type {
	ContentTypeOptions,
	Fields,
	SiteOptions
} from '/lib/explorer/types/Collector.d';
import type {
	CollectorComponents,
	Locales
} from '../index.d';
import type {QueryCollectionsHits} from './index.d';


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
	collectorOptions :Array<DropdownItemProps>
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
		isStateChanged,
		language,
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
		setLanguage,
		setNameVisited
	} = useCollectionState({
		collections,
		doClose,
		initialValues,
		servicesBaseUrl
	});

	return <>
		<Modal.Content>
			<Segment color='black'>
				<Header as='h1' dividing content='Collection' id='collection'/>
				<Form>
					<Form.Input
						error={nameError}
						fluid
						label='Name'
						onBlur={() => nameOnBlur(name)}
						onChange={nameOnChange}
						placeholder='Please input an unique name'
						value={name}
					/>
					<Form.Field>
						<LanguageDropdown
							locales={locales}
							language={language}
							setLanguage={setLanguage}
						/>
					</Form.Field>
					<Header as='h2' dividing content='Collector'/>
					<CollectorSelector
						collectorName={collectorName}
						options={collectorOptions}
						setCollectorName={setCollectorName}
					/>
					{collectorName
						? <DocumentTypeSelector
							documentTypeId={documentTypeId}
							servicesBaseUrl={servicesBaseUrl}
							setDocumentTypeId={setDocumentTypeId}
						/>
						: null
					}
				</Form>
			</Segment>
			<CollectorOptions
				collectorComponentRef={collectorComponentRef}
				collectorComponents={collectorComponents}
				collectorConfig={collectorConfig}
				collectorName={collectorName}
				contentTypeOptions={contentTypeOptions}
				fields={fields}
				siteOptions={siteOptions}
				setCollectorConfig={setCollectorConfig}
				setCollectorConfigErrorCount={setCollectorConfigErrorCount}
			/>
			{collectorName
				? <SchedulingSegment
					cronArray={cronArray}
					doCollect={doCollect}
					setCronArray={setCronArray}
					setDoCollect={setDoCollect}
				/>
				: null
			}
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<ResetButton
				isStateChanged={isStateChanged}
				onClick={resetState}
				secondary
			/>
			<SubmitButton
				errorCount={errorCount}
				onClick={onSubmit}
				isStateChanged={isStateChanged}
				primary
			/>
		</Modal.Actions>
	</>;
} // function Collection
