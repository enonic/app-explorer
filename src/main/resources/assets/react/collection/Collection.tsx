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
import {GQL_MUTATION_CREATE_COLLECTION} from '../../../services/graphQL/collection/mutationCreateCollection';
import {GQL_MUTATION_UPDATE_COLLECTION} from '../../../services/graphQL/collection/mutationUpdateCollection';
import {repoIdValidator} from '../utils/repoIdValidator';
import {ResetButton} from '../components/ResetButton';
import {SubmitButton} from '../components/SubmitButton';
import {CollectorOptions} from './CollectorOptions';
import {CollectorSelector} from './CollectorSelector';
import {LanguageDropdown} from './LanguageDropdown';
import {SchedulingSegment} from './SchedulingSegment';
import {DocumentTypeSelector} from './DocumentTypeSelector';
import {useCollectionState} from './useCollectionState';


export function Collection({
	collections,
	collectorComponents,
	collectorOptions,
	contentTypeOptions,
	doClose,
	fields = {},
	locales, // []
	servicesBaseUrl,
	siteOptions,
	initialValues = {
		_name: '',
		collector: {
			//config: {}, // CollectorSelector onChange will set this.
			//configJson: '{}',
			name: ''//,
			//taskName: 'collect'//, // TODO
		},
		cron: [{ // Default once a week
			month: '*',
			dayOfMonth: '*',
			dayOfWeek: '0',
			minute: '0',
			hour: '0'
		}],
		doCollect: false,
		language: ''
	} as CollectionFormValues
} :{
	collections :QueryCollectionsHits
	collectorComponents :CollectorComponents
	collectorOptions :Array<DropdownItemProps>
	contentTypeOptions :ContentTypeOptions
	doClose :() => void
	fields :Fields
	locales :Locales
	initialValues :CollectionFormValues
	servicesBaseUrl :string
	siteOptions :SiteOptions
}) {
	const {
		collectionNames,
		collectorConfig,
		collectorName,
		cronArray,
		doCollect,
		documentTypeId,
		isStateChanged,
		language,
		name,
		nameError,
		resetState,
		setCollectorConfig,
		setCollectorName,
		setCronArray,
		setDoCollect,
		setDocumentTypeId,
		setLanguage,
		setName,
		setNameError
	} = useCollectionState({
		collections,
		initialValues
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
						onBlur={() => {
							if (!name) {
								setNameError('Name is required!');
							}
						}}
						onChange={(_event,{value: newName}) => {
							setName(newName);
							const newNameError = (
								newName !== initialValues._name && collectionNames.includes(newName)
							)
								? `The name "${newName}" is already in use, please input another name."`
								: repoIdValidator(newName);
							if (newNameError !== nameError) {
								setNameError(newNameError);
							}
						}}
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
				collectorComponents={collectorComponents}
				collectorConfig={collectorConfig}
				collectorName={collectorName}
				contentTypeOptions={contentTypeOptions}
				fields={fields}
				siteOptions={siteOptions}
				setCollectorConfig={setCollectorConfig}
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
				onClick={() => {
					const {_id} = initialValues;
					//console.debug('submit _id', _id);
					const variables :{
						_id ?:string
						_name :string
						collector ?:{
							configJson ?:string
							name ?:string
						}
						cron :Array<{
							month :string
							dayOfMonth :string
							dayOfWeek :string
							minute :string
							hour :string
						}>
						doCollect :boolean
						documentTypeId ?:string
						language :string
					} = {
						_name: name,
						cron: cronArray,
						doCollect,
						language
					};
					if (documentTypeId && !documentTypeId.startsWith('_')) {
						variables.documentTypeId = documentTypeId;
					}
					if (collectorName || collectorConfig) {
						variables.collector = {};
						if (collectorName) {
							variables.collector.name = collectorName;
						}
						if (collectorConfig) {
							variables.collector.configJson = JSON.stringify(collectorConfig);
						}
					}
					if (_id) {
						variables._id = _id;
					}
					//console.debug('submit variables', variables);

					fetch(`${servicesBaseUrl}/graphQL`, {
						method: 'POST',
						headers: {
							'Content-Type':	'application/json'
						},
						body: JSON.stringify({
							query: _id ? GQL_MUTATION_UPDATE_COLLECTION : GQL_MUTATION_CREATE_COLLECTION,
							variables
						})
					}).then(response => {
						if (response.status === 200) { doClose(); }
					});
				}}
				isStateChanged={isStateChanged}
				primary
			/>
		</Modal.Actions>
	</>;
} // function Collection
