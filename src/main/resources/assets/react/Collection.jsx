import {Form, Header, Label, Segment} from 'semantic-ui-react';

import {
	Form as EnonicForm,
	Input,
	ResetButton,
	SubmitButton
} from 'semantic-ui-react-form';

import {CollectorOptions} from './collection/CollectorOptions';
import {CollectorSelector} from './collection/CollectorSelector';
import {LanguageDropdown} from './collection/LanguageDropdown';
import {SchedulingSegment} from './collection/SchedulingSegment';


function isSane(value) {
	if(!value) {
		return 'Required!';
	}
	const matches = value.match(/[^-a-zA-Z0-9+]/g);
	if (matches) {
		return `Illegal characters: ${matches.join('')}`;
	}
	return undefined;
}


/*function required(value) {
	return value ? undefined : 'Required!';
}*/


const SCHEMA = {
	_name: (v) => isSane(v)
};


export function Collection(props) {
	//console.debug('Collection props', props);

	const {
		collectorComponents,
		collectorOptions,
		contentTypeOptions,
		fields = {},
		locales, // []
		mode,
		onClose,
		servicesBaseUrl,
		siteOptions,
		initialValues = {
			_name: '',
			collector: {
				name: ''//,
				//taskName: 'collect'//, // TODO
				//config: null // CollectorSelector onChange will set this.
			},
			cron: [{
				month: '*',
				dayOfMonth: '*',
				dayOfWeek: '*',
				minute: '*',
				hour: '*'
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
			fetch(`${servicesBaseUrl}/collection${mode === 'create' ? 'Create' : 'Modify'}`, {
				method: 'POST',
				headers: {
					'Content-Type':	'application/json'
				},
				body: JSON.stringify(values)
			}).then((/*response*/) => {
				onClose();
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
