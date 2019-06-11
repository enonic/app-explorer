import {connect, FieldArray, getIn} from 'formik';
import {Button, Header, Table} from 'semantic-ui-react';
import {
	Dropdown,
	//Input,
	InsertButton,
	MoveDownButton,
	MoveUpButton,
	RemoveButton
} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';
//import {toStr} from '../utils/toStr';


export const Cron = connect(({
	formik,
	parentPath,
	name = 'cron',
	path = parentPath ? `${parentPath}.${name}` : name,
	value = getIn(formik.values, path, [{
		minute: '*',
		hour: '*',
		dayOfMonth: '*',
		month: '*',
		dayOfWeek: '*'
	}])
}) => {
	/*console.debug(toStr({
		component: 'Cron',
		path,
		value
	}));*/
	return <>
		<Header as='h2' content='Scheduling' dividing id='cron'/>
		<Table celled compact selectable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Month</Table.HeaderCell>
					<Table.HeaderCell>Day of month</Table.HeaderCell>
					<Table.HeaderCell>Day of week</Table.HeaderCell>
					<Table.HeaderCell>Hour</Table.HeaderCell>
					<Table.HeaderCell>Minute</Table.HeaderCell>
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<FieldArray
					name={path}
					render={() => value.map(({
						minute = '*', // 0-59
						hour = '*', // 0-23
						dayOfMonth = '*', // 1-31
						month = '*', // 1-12
						dayOfWeek = '*' // 0-6 Sunday to Saturday 7 is also Sunday on some systems
					}, index) => {
						const key =`${path}[${index}]`;
						/*console.debug(toStr({
							component: 'Cron',
							month,
							dayOfMonth,
							dayOfWeek,
							hour,
							minute,
							index,
							key
						}));*/
						return <Table.Row key={key}>
							<Table.Cell>
								<Dropdown
									formik={formik}
									name='month'
									options={MONTH_OPTIONS.map(({value, text = value}) => ({
										key: value,
										text,
										value
									}))}
									parentPath={key}
									placeholder='Select month'
									search
									selection
									value={month}
								/>
							</Table.Cell>
							<Table.Cell>
								<Dropdown
									formik={formik}
									name='dayOfMonth'
									parentPath={key}
									options={DAY_OF_MONTH_OPTIONS.map(({value, text = value}) => ({
										key: value,
										text,
										value
									}))}
									search
									selection
									value={dayOfMonth}
								/>
							</Table.Cell>
							<Table.Cell>
								<Dropdown
									formik={formik}
									name='dayOfWeek'
									parentPath={key}
									options={DAY_OF_WEEK_OPTIONS.map(({value, text = value}) => ({
										key: value,
										text,
										value
									}))}
									search
									selection
									value={dayOfWeek}
								/>
							</Table.Cell>
							<Table.Cell>
								<Dropdown
									formik={formik}
									name='hour'
									parentPath={key}
									options={HOUR_OPTIONS.map(({value, text = value}) => ({
										key: value,
										text,
										value
									}))}
									search
									selection
									value={hour}
								/>
							</Table.Cell>
							<Table.Cell>
								<Dropdown
									formik={formik}
									name='minute'
									parentPath={key}
									options={MINUTE_OPTIONS.map(({value, text = value}) => ({
										key: value,
										text,
										value
									}))}
									search
									selection
									value={minute}
								/>
								{/*<Input
									formik={formik}
									name='minute'
									parentPath={key}
									value={minute}
								/>*/}
							</Table.Cell>
							<Table.Cell>
								<Button.Group icon>
									<InsertButton formik={formik} index={index} path={path} value={{
										minute: '*',
										hour: '*',
										dayOfMonth: '*',
										month: '*',
										dayOfWeek: '*'
									}}/>
									<RemoveButton formik={formik} index={index} path={path}/>
									<MoveDownButton formik={formik} index={index} path={path} visible={value.length > 1}/>
									<MoveUpButton formik={formik} index={index} path={path} visible={value.length > 1}/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}
				/>
			</Table.Body>
		</Table>
	</>;
}) // Cron


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


// Day of the week 0-6 Sunday to Saturday 7 is also Sunday on some systems
const DAY_OF_WEEK_OPTIONS = [{
	text: 'Every day of the week',
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
