import type {SemanticUi} from '../../../types/SemanticUi.d';
import type {
	CollectionValues,
	CollectorComponents,
	ContentTypeOptions,
	Fields,
	Locales,
	SiteOptions
} from '../index.d';


import * as React from 'react';
import {
	Button,
	Form,
	Header,
	Icon,
	//Label,
	Modal,
	Segment
} from 'semantic-ui-react';

import {
	Form as EnonicForm,
	Input,
	ResetButton,
	SubmitButton
	//@ts-ignore
} from 'semantic-ui-react-form';

import {GQL_MUTATION_CREATE_COLLECTION} from '../../../services/graphQL/collection/mutationCreateCollection';
import {GQL_MUTATION_UPDATE_COLLECTION} from '../../../services/graphQL/collection/mutationUpdateCollection';
import {repoIdValidator} from '../utils/repoIdValidator';

import {CollectorOptions} from './CollectorOptions';
import {CollectorSelector} from './CollectorSelector';
import {LanguageDropdown} from './LanguageDropdown';
import {SchedulingSegment} from './SchedulingSegment';
import {DocumentTypeSelector} from './DocumentTypeSelector';


const SCHEMA = {
	_name: (v :string) => repoIdValidator(v)
};


export function Collection(props :{
	collectorComponents :CollectorComponents
	collectorOptions :SemanticUi.Dropdown.Options
	contentTypeOptions :ContentTypeOptions
	doClose :() => void
	fields :Fields
	locales :Locales
	initialValues :CollectionValues
	servicesBaseUrl :string
	siteOptions :SiteOptions
}) {
	//console.debug('Collection props', props);

	const {
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
		} as CollectionValues
	} = props;
	//console.debug('Collection initialValues', initialValues);

	if (initialValues.collector && initialValues.collector.configJson) {
		initialValues.collector.config = JSON.parse(initialValues.collector.configJson);
	}

	return <EnonicForm
		afterValidate={(/*dereffed*/) => {
			//console.debug('Collection afterValidate dereffed', dereffed);
		}}
		afterVisit={(/*dereffed*/) => {
			//console.debug('Collection afterVisit dereffed', dereffed);
		}}
		initialValues={initialValues}
		onChange={(/*values*/) => {
			//console.debug('Collection onChange values', values);
		}}
		onSubmit={(values :CollectionValues) => {
			//console.debug('submit values', values);

			const {_id} = initialValues;
			//console.debug('submit _id', _id);

			const {
				_name,
				collector: {
					name: collectorName,
					config: collectorConfig
				} = {},
				cron,
				doCollect,
				documentTypeId,
				language
			} = values;
			//console.debug('submit _name', _name);
			//console.debug('submit collectorName', collectorName);
			//console.debug('submit collectorConfig', collectorConfig);
			//console.debug('submit cron', cron);
			//console.debug('submit doCollect', doCollect);
			//console.debug('submit documentTypeId', documentTypeId);

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
				_name,
				cron,
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
		schema={SCHEMA}
	>
		<Modal.Content>
			<Form>
				<Segment color='black'>
					<Header as='h1' dividing content='Collection' id='collection'/>
					<Form.Field>
						<Input
							fluid
							label='Name'
							path='_name'
						/>
					</Form.Field>
					<Form.Field>
						{/*<Label content='Language' size='large'/>*/}
						<LanguageDropdown locales={locales}/>
					</Form.Field>
					<Header as='h2' dividing content='Collector'/>
					<CollectorSelector
						options={collectorOptions}
					/>
					<DocumentTypeSelector
						servicesBaseUrl={servicesBaseUrl}
					/>
				</Segment>
				<CollectorOptions
					collectorComponents={collectorComponents}
					contentTypeOptions={contentTypeOptions}
					fields={fields}
					siteOptions={siteOptions}
				/>
				<SchedulingSegment />
			</Form>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			{/*<VisitAllButton/>*/}
			{/*<ValidateFormButton/>*/}
			<ResetButton secondary/>
			<SubmitButton primary><Icon name='save'/>Save</SubmitButton>
		</Modal.Actions>
	</EnonicForm>;
} // function Collection
