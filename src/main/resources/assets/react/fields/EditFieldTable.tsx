import {
	INDEX_CONFIG_N_GRAM,
	VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING
} from '@enonic/js-utils';

import {
	Input, Popup, Table
} from 'semantic-ui-react';
//@ts-ignore
import {setValue} from 'semantic-ui-react-form';
//@ts-ignore
import {getEnonicContext} from 'semantic-ui-react-form/Context';
//@ts-ignore
import {Checkbox as EnonicCheckbox} from 'semantic-ui-react-form/inputs/Checkbox';
//@ts-ignore
import {Dropdown as EnonicDropdown} from 'semantic-ui-react-form/inputs/Dropdown';


const OPTIONS_VALUE_TYPES = [
	VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING
].map(key => ({
	key,
	text: key,
	value: key
}));

/*const OPTIONS_VALUE_TYPES = [{
	key: VALUE_TYPE_ANY,
	text: 'Any', // Don't validate type
	value: VALUE_TYPE_ANY
},{
	key: VALUE_TYPE_STRING,
	text: 'String',
	value: VALUE_TYPE_STRING
},{
	key: 'text',
	text: 'Text', // TODO migrate to VALUE_TYPE_STRING and remove
	value: 'text'
},{
	key: VALUE_TYPE_BOOLEAN,
	text: 'Boolean',
	value: VALUE_TYPE_BOOLEAN
},{
	key: VALUE_TYPE_DOUBLE, // float
	text: 'Double (Double-precision 64-bit IEEE 754 floating point.)',
	value: VALUE_TYPE_DOUBLE
},{
	key: VALUE_TYPE_LONG, // int
	text: 'Long (64-bit two’s complement integer.)',
	value: VALUE_TYPE_LONG
},{
	key: VALUE_TYPE_GEO_POINT,
	text: 'GeoPoint',
	value: VALUE_TYPE_GEO_POINT
},{
	key: VALUE_TYPE_INSTANT,
	text: 'Instant - An ISO-8601-formatted instant (e.g \'2011-12-03T10:15:30Z\')',
	value: VALUE_TYPE_INSTANT
},{
	key: VALUE_TYPE_LOCAL_DATE,
	text: 'LocalDate - A ISO local date-time string (e.g \'2011-12-03\')',
	value: VALUE_TYPE_LOCAL_DATE
},{
	key: VALUE_TYPE_LOCAL_DATE_TIME,
	text: 'LocalDateTime - A local date-time string (e.g \'2007-12-03T10:15:30\')',
	value: VALUE_TYPE_LOCAL_DATE_TIME
},{
	key: VALUE_TYPE_LOCAL_TIME,
	text: 'LocalTime - A ISO local date-time string (e.g \'10:15:30\')',
	value: VALUE_TYPE_LOCAL_TIME
},/*{
	key: 'reference',
	text: 'Reference',
	value: 'reference'
},*{
	key: VALUE_TYPE_SET,
	text: 'Set',
	value: VALUE_TYPE_SET
},{
	key: 'tag',
	text: 'Tag', // TODO migrate to VALUE_TYPE_STRING and remove
	value: 'tag'
},{
	key: 'uri',
	text: 'Uri', // TODO migrate to VALUE_TYPE_STRING and remove
	value: 'uri'
},{
	key: 'html',
	text: 'HTML', // TODO migrate to VALUE_TYPE_STRING and remove
	value: 'html'
},/*{
	key: 'xml',
	text: 'XML',
	value: 'xml'
},*{
	key: 'base64',
	text: 'Base64 encoded data', // TODO migrate to VALUE_TYPE_STRING and remove
	value: 'base64'
}];*/


export const EditFieldTable = () => {
	const [context, dispatch] = getEnonicContext();
	const {
		//fieldType,
		min,
		max,
		enabled
	} = context.values;
	//console.debug('enabled', enabled);
	return <Table celled compact>
		<Table.Header>
			<Table.Row>
				<Table.HeaderCell textAlign='center'>Value type</Table.HeaderCell>
				<Table.HeaderCell textAlign='center'>Min</Table.HeaderCell>
				<Table.HeaderCell textAlign='center'>Max</Table.HeaderCell>
				<Table.HeaderCell collapsing textAlign='center'>Enabled</Table.HeaderCell>
				<Table.HeaderCell collapsing disabled={!enabled} textAlign='center'>Decide by type</Table.HeaderCell>
				<Table.HeaderCell collapsing disabled={!enabled} textAlign='center'>Fulltext</Table.HeaderCell>
				<Table.HeaderCell collapsing disabled={!enabled} textAlign='center'>Ngram</Table.HeaderCell>
				<Table.HeaderCell collapsing disabled={!enabled} textAlign='center'>Include in _allText</Table.HeaderCell>
				<Table.HeaderCell collapsing disabled={!enabled} textAlign='center'>Path</Table.HeaderCell>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			<Table.Row>
				<Table.Cell textAlign='center'><EnonicDropdown
					options={OPTIONS_VALUE_TYPES}
					name='fieldType'
					selection
				/></Table.Cell>
				<Table.Cell textAlign='center'><Popup content='>0 means required' trigger={
					<Input
						min={0}
						name='min'
						onChange={(
							//@ts-ignore
							event,
							{value: newMinString}
						) => {
							const newMinInt = parseInt(newMinString);
							if (newMinInt > max && max !== 0) {
								dispatch(setValue({
									path: 'max',
									value: newMinInt
								}));
							}
							dispatch(setValue({
								path: 'min',
								value: newMinInt
							}));
						}}
						type='number'
						value={min}
					/>
				}/></Table.Cell>
				<Table.Cell textAlign='center'><Popup content='0 means infinite' trigger={
					<Input
						min={0}
						name='max'
						onChange={(
							//@ts-ignore
							event,
							{value: newMaxString}
						) => {
							const newMaxInt = parseInt(newMaxString);
							if (newMaxInt !== 0 && newMaxInt < min) {
								dispatch(setValue({
									path: 'min',
									value: newMaxInt
								}));
							}
							dispatch(setValue({
								path: 'max',
								value: newMaxInt
							}));
						}}
						type='number'
						value={max}
					/>
				}/></Table.Cell>
				<Table.Cell collapsing textAlign='center'><EnonicCheckbox
					name='enabled'
					toggle
				/></Table.Cell>
				<Table.Cell collapsing textAlign='center'><EnonicCheckbox
					disabled={!enabled}
					name='decideByType'
					toggle
				/></Table.Cell>
				<Table.Cell collapsing textAlign='center'><EnonicCheckbox
					disabled={!enabled}
					name='fulltext'
					toggle
				/></Table.Cell>
				<Table.Cell collapsing textAlign='center'><EnonicCheckbox
					disabled={!enabled}
					name={INDEX_CONFIG_N_GRAM}
					toggle
				/></Table.Cell>
				<Table.Cell collapsing textAlign='center'><EnonicCheckbox
					disabled={!enabled}
					name='includeInAllText'
					toggle
				/></Table.Cell>
				<Table.Cell collapsing textAlign='center'><EnonicCheckbox
					disabled={!enabled}
					name='path'
					toggle
				/></Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table>;
};
