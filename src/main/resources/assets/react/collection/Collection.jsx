import {Form, Header, Label, Segment} from 'semantic-ui-react';

import {
	Form as EnonicForm,
	Input,
	ResetButton,
	SubmitButton
} from 'semantic-ui-react-form';

import {GQL_MUTATION_CREATE_COLLECTION} from '../../../services/graphQL/collection/mutationCreateCollection';
import {GQL_MUTATION_UPDATE_COLLECTION} from '../../../services/graphQL/collection/mutationUpdateCollection';
import {nameValidator} from '../utils/nameValidator';

import {CollectorOptions} from './CollectorOptions';
import {CollectorSelector} from './CollectorSelector';
import {LanguageDropdown} from './LanguageDropdown';
import {SchedulingSegment} from './SchedulingSegment';
import {DocumentTypeSelector} from './DocumentTypeSelector';


const SCHEMA = {
	_name: (v) => nameValidator(v)
};


export function Collection(props) {
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
				name: ''//,
				//taskName: 'collect'//, // TODO
				//config: null // CollectorSelector onChange will set this.
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
		}
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
		onSubmit={(values) => {
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

			const variables = {
				_name,
				cron,
				doCollect,
				documentTypeId,
				language
			};
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
		<Segment color='black'>
			<Header as='h1' dividing content='Collection' id='collection'/>
			<Input
				fluid
				label='Name'
				path='_name'
			/>
			<Form.Field>
				<Label content='Language' size='large'/>
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
		<Form.Field>
			<SubmitButton/>
			<ResetButton/>
		</Form.Field>
	</EnonicForm>;
} // function Collection
