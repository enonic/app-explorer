import {Button, Form, Header, Segment, Table} from 'semantic-ui-react';

import {
	Checkbox,
	DeleteItemButton,
	Dropdown,
	Form as EnonicForm,
	Input,
	InsertButton,
	List,
	MoveDownButton,
	MoveUpButton,
	ResetButton,
	SubmitButton
} from 'semantic-ui-react-form';

import {CollectorOptions} from './collection/CollectorOptions';
import {CollectorSelector} from './collection/CollectorSelector';


function required(value) {
	return value ? undefined : 'Required!';
}


const SCHEMA = {
	displayName: (v) => required(v)
};


export function Collection(props) {
	//console.debug('Collection props', props);

	const {
		collectorComponents,
		collectorOptions,
		contentTypeOptions,
		fields = {},
		onClose,
		mode,
		servicesBaseUrl,
		siteOptions,
		initialValues = {
			displayName: '',
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
			doCollect: false
		}
	} = props;
	//console.debug('Collection initialValues', initialValues);

	if (initialValues.collector && initialValues.collector.configJson) {
		initialValues.collector.config = JSON.parse(initialValues.collector.configJson);
	}

	const cronPath = 'cron';

	return <EnonicForm
		afterValidate={(dereffed) => {
			//console.debug('Collection afterValidate dereffed', dereffed);
		}}
		afterVisit={(dereffed) => {
			//console.debug('Collection afterVisit dereffed', dereffed);
		}}
		initialValues={initialValues}
		onChange={(values) => {
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
			}).then(response => {
				onClose();
			})
		}}
		schema={SCHEMA}
	>
		<Segment color='black'>
			<Header as='h1' dividing content='Collection' id='collection'/>
			<Input
				fluid
				label='Display name'
				path='displayName'
			/>
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
		<Segment color='green'>
			<Header as='h2' dividing content='Scheduling' id='cron'/>
			<Checkbox
				path='doCollect'
				label='Activate scheduling'
			/>
			<List
				path={cronPath}
				render={(cronArray) => {
					//console.debug('Collection List cronArray', cronArray);
					return cronArray.map(({
						minute,
						hour,
						dayOfMonth,
						month,
						dayOfWeek
					}, index) => {
						const key=`cron.${index}`;
						return <Table celled compact selectable striped key={key}>
							<Table.Body>
								<Table.Row>
									<Table.HeaderCell>Month</Table.HeaderCell>
									<Table.Cell><Dropdown
										options={MONTH_OPTIONS.map(({value, text = value}) => ({
											key: value,
											text,
											value
										}))}
										path={`${key}.month`}
										placeholder='Select month'
										search
										selection
										value={month}
									/></Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.HeaderCell>Day of month</Table.HeaderCell>
									<Table.Cell><Dropdown
										options={DAY_OF_MONTH_OPTIONS.map(({value, text = value}) => ({
											key: value,
											text,
											value
										}))}
										path={`${key}.dayOfMonth`}
										placeholder='Select day of month'
										search
										selection
										value={dayOfMonth}
									/></Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.HeaderCell>Day of week</Table.HeaderCell>
									<Table.Cell><Dropdown
										options={DAY_OF_WEEK_OPTIONS.map(({value, text = value}) => ({
											key: value,
											text,
											value
										}))}
										path={`${key}.dayOfWeek`}
										placeholder='Select day of week'
										search
										selection
										value={dayOfWeek}
									/></Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.HeaderCell>Hour</Table.HeaderCell>
									<Table.Cell><Dropdown
										options={HOUR_OPTIONS.map(({value, text = value}) => ({
											key: value,
											text,
											value
										}))}
										path={`${key}.hour`}
										placeholder='Select hour'
										search
										selection
										value={hour}
									/></Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.HeaderCell>Minute</Table.HeaderCell>
									<Table.Cell><Dropdown
										options={MINUTE_OPTIONS.map(({value, text = value}) => ({
											key: value,
											text,
											value
										}))}
										path={`${key}.minute`}
										placeholder='Select minute'
										search
										selection
										value={minute}
									/></Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.HeaderCell>Actions</Table.HeaderCell>
									<Table.Cell>
										<Button.Group icon>
											<InsertButton
												path={cronPath}
												index={index+1}
												value={{
													month: '*',
													dayOfMonth: '*',
													dayOfWeek: '*',
													minute: '*',
													hour: '*'
												}}
											/>
											<MoveDownButton
												disabled={index + 1 >= cronArray.length}
												path={cronPath}
												index={index}
											/>
											<MoveUpButton
												path={cronPath}
												index={index}
											/>
											<DeleteItemButton
												disabled={cronArray.length < 2}
												path={cronPath}
												index={index}
											/>
										</Button.Group>
									</Table.Cell>
								</Table.Row>
							</Table.Body>
						</Table>;
					});
				}}
			/>
		</Segment>
		<Form.Field>
			<SubmitButton/>
			<ResetButton/>
		</Form.Field>
	</EnonicForm>;
} // function Collection


// Hour 0-23
const HOUR_OPTIONS = [{
	text: 'Every hour',
	value: '*'
},{
	value: '0'
},{
	value: '1'
},{
	value: '2'
},{
	value: '3'
},{
	value: '4'
},{
	value: '5'
},{
	value: '6'
},{
	value: '7'
},{
	value: '8'
},{
	value: '9'
},{
	value: '10'
},{
	value: '11'
},{
	value: '12'
},{
	value: '13'
},{
	value: '14'
},{
	value: '15'
},{
	value: '16'
},{
	value: '17'
},{
	value: '18'
},{
	value: '19'
},{
	value: '20'
},{
	value: '21'
},{
	value: '22'
},{
	value: '23'
}];


// Day of month 1-31
const DAY_OF_MONTH_OPTIONS = [{
	text: 'Every day of the month',
	value: '*'
},{
	value: '1'
},{
	value: '2'
},{
	value: '3'
},{
	value: '4'
},{
	value: '5'
},{
	value: '6'
},{
	value: '7'
},{
	value: '8'
},{
	value: '9'
},{
	value: '10'
},{
	value: '11'
},{
	value: '12'
},{
	value: '13'
},{
	value: '14'
},{
	value: '15'
},{
	value: '16'
},{
	value: '17'
},{
	value: '18'
},{
	value: '19'
},{
	value: '20'
},{
	value: '21'
},{
	value: '22'
},{
	value: '23'
},{
	value: '24'
},{
	value: '25'
},{
	value: '26'
},{
	value: '27'
},{
	value: '28'
},{
	value: '29'
},{
	value: '30'
},{
	value: '31'
}];


// Minute 0-59
const MINUTE_OPTIONS = [{
	text: 'Every minute',
	value: '*'
},{
	value: '0'
},{
	value: '1'
},{
	value: '2'
},{
	value: '3'
},{
	value: '4'
},{
	value: '5'
},{
	value: '6'
},{
	value: '7'
},{
	value: '8'
},{
	value: '9'
},{
	value: '10'
},{
	value: '11'
},{
	value: '12'
},{
	value: '13'
},{
	value: '14'
},{
	value: '15'
},{
	value: '16'
},{
	value: '17'
},{
	value: '18'
},{
	value: '19'
},{
	value: '20'
},{
	value: '21'
},{
	value: '22'
},{
	value: '23'
},{
	value: '24'
},{
	value: '25'
},{
	value: '26'
},{
	value: '27'
},{
	value: '28'
},{
	value: '29'
},{
	value: '30'
},{
	value: '31'
},{
	value: '32'
},{
	value: '33'
},{
	value: '34'
},{
	value: '35'
},{
	value: '36'
},{
	value: '37'
},{
	value: '38'
},{
	value: '39'
},{
	value: '40'
},{
	value: '41'
},{
	value: '42'
},{
	value: '43'
},{
	value: '44'
},{
	value: '45'
},{
	value: '46'
},{
	value: '47'
},{
	value: '48'
},{
	value: '49'
},{
	value: '50'
},{
	value: '51'
},{
	value: '52'
},{
	value: '53'
},{
	value: '54'
},{
	value: '55'
},{
	value: '56'
},{
	value: '57'
},{
	value: '58'
},{
	value: '59'
}];


// Month 1-12
const MONTH_OPTIONS = [{
	text: 'Every month',
	value: '*'
},{
	text: 'January',
	value: '1'
},{
	text: 'February',
	value: '2'
},{
	text: 'March',
	value: '3'
},{
	text: 'April',
	value: '4'
},{
	text: 'May',
	value: '5'
},{
	text: 'June',
	value: '6'
},{
	text: 'July',
	value: '7'
},{
	text: 'August',
	value: '8'
},{
	text: 'September',
	value: '9'
},{
	text: 'October',
	value: '10'
},{
	text: 'November',
	value: '11'
},{
	text: 'December',
	value: '12'
}];

export const MONTH_TO_HUMAN = {};
MONTH_OPTIONS.forEach(({text, value}) => {
	MONTH_TO_HUMAN[value] = text;
});


// Day of the week 0-6 Sunday to Saturday 7 is also Sunday on some systems
const DAY_OF_WEEK_OPTIONS = [{
	text: 'Every day',
	value: '*'
},{
	text: 'Sunday',
	value: '0'
},{
	text: 'Monday',
	value: '1'
},{
	text: 'Tuesday',
	value: '2'
},{
	text: 'Wednesday',
	value: '3'
},{
	text: 'Thursday',
	value: '4'
},{
	text: 'Friday',
	value: '5'
},{
	text: 'Saturday',
	value: '6'
}];

export const DAY_OF_WEEK_TO_HUMAN = {};
DAY_OF_WEEK_OPTIONS.forEach(({text, value}) => {
	DAY_OF_WEEK_TO_HUMAN[value] = text;
});
