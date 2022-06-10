import type {Cron} from './index.d';


import {
	Button,
	Checkbox,
	Dropdown,
	Header,
	Segment,
	Table
} from 'semantic-ui-react';
import {DeleteItemButton} from '../components/DeleteItemButton';
import {InsertButton} from '../components/InsertButton';
import {MoveDownButton} from '../components/MoveDownButton';
import {MoveUpButton} from '../components/MoveUpButton';



export function SchedulingSegment({
	cronArray,
	doCollect,
	setCronArray,
	setDoCollect
} :{
	cronArray :Array<Cron>
	doCollect :boolean
	setCronArray :(cronArray :Array<Cron>) => void
	setDoCollect :(doCollect :boolean) => void
}) {
	return <Segment color='green'>
		<Header as='h2' dividing content='Scheduling' id='cron'/>
		<Checkbox
			checked={doCollect}
			onChange={(_event, {checked}) => setDoCollect(checked)}
			label='Activate scheduling'
		/>
		{cronArray.map(({
			minute,
			hour,
			dayOfMonth,
			month,
			dayOfWeek
		}, index) => {
			return <Table celled compact selectable striped key={index}>
				<Table.Body>
					<Table.Row>
						<Table.HeaderCell>Month</Table.HeaderCell>
						<Table.Cell><Dropdown
							onChange={(_e,{value:newMonth}) => {
								const deref = JSON.parse(JSON.stringify(cronArray));
								deref[index] = {
									...deref[index],
									month: newMonth
								};
								setCronArray(deref);
							}}
							options={MONTH_OPTIONS.map(({value, text = value}) => ({
								key: value,
								text,
								value
							}))}
							placeholder='Select month'
							search
							selection
							value={month}
						/></Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.HeaderCell>Day of month</Table.HeaderCell>
						<Table.Cell><Dropdown
							onChange={(_e,{value:newDayOfMonth}) => {
								const deref = JSON.parse(JSON.stringify(cronArray));
								deref[index] = {
									...deref[index],
									dayOfMonth: newDayOfMonth
								};
								setCronArray(deref);
							}}
							options={DAY_OF_MONTH_OPTIONS.map(({value, text = value}) => ({
								key: value,
								text,
								value
							}))}
							placeholder='Select day of month'
							search
							selection
							value={dayOfMonth}
						/></Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.HeaderCell>Day of week</Table.HeaderCell>
						<Table.Cell><Dropdown
							onChange={(_e,{value:newDayOfWeek}) => {
								const deref = JSON.parse(JSON.stringify(cronArray));
								deref[index] = {
									...deref[index],
									dayOfWeek: newDayOfWeek
								};
								setCronArray(deref);
							}}
							options={DAY_OF_WEEK_OPTIONS.map(({value, text = value}) => ({
								key: value,
								text,
								value
							}))}
							placeholder='Select day of week'
							search
							selection
							value={dayOfWeek}
						/></Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.HeaderCell>Hour</Table.HeaderCell>
						<Table.Cell><Dropdown
							onChange={(_e,{value:newHour}) => {
								const deref = JSON.parse(JSON.stringify(cronArray));
								deref[index] = {
									...deref[index],
									hour: newHour
								};
								setCronArray(deref);
							}}
							options={HOUR_OPTIONS.map(({value, text = value}) => ({
								key: value,
								text,
								value
							}))}
							placeholder='Select hour'
							search
							selection
							value={hour}
						/></Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.HeaderCell>Minute</Table.HeaderCell>
						<Table.Cell><Dropdown
							onChange={(_e,{value:newMinute}) => {
								const deref = JSON.parse(JSON.stringify(cronArray));
								deref[index] = {
									...deref[index],
									minute: newMinute
								};
								setCronArray(deref);
							}}
							options={MINUTE_OPTIONS.map(({value, text = value}) => ({
								key: value,
								text,
								value
							}))}
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
									array={cronArray}
									insertAtIndex={index+1}
									setArrayFunction={setCronArray}
									valueToInsert={{
										month: '*',
										dayOfMonth: '*',
										dayOfWeek: '0',
										minute: '0',
										hour: '0'
									}}
								/>
								<MoveDownButton
									array={cronArray}
									disabled={index + 1 >= cronArray.length}
									index={index}
									setArrayFunction={setCronArray}
								/>
								<MoveUpButton
									array={cronArray}
									index={index}
									setArrayFunction={setCronArray}
								/>
								<DeleteItemButton
									array={cronArray}
									disabled={cronArray.length < 2}
									index={index}
									setArrayFunction={setCronArray}
								/>
							</Button.Group>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>;
		})}
	</Segment>;
}

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
