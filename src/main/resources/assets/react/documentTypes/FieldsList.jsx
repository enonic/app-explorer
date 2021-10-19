import getIn from 'get-value';
import {
	//Button,
	Form,
	Icon,
	Radio,
	Table
} from 'semantic-ui-react';
import {getEnonicContext} from 'semantic-ui-react-form/Context';
//import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';
//import {List} from 'semantic-ui-react-form/List';

import {ButtonDelete} from '../components/ButtonDelete';
import {ButtonEdit} from '../components/ButtonEdit';
import {Checkmark} from '../components/Checkmark';
//import {Span} from '../components/Span';
import {AddOrEditLocalField} from './AddOrEditLocalField';
//import {RemoveFieldFromDocumentTypeModal} from './RemoveFieldFromDocumentTypeModal';


//const PATH_PROPERTIES = 'properties';


export const FieldsList = ({
	//collections,
	globalFields//,
	//interfaces,
	//servicesBaseUrl
}) => {
	const [context/*, dispatch*/] = getEnonicContext();

	const properties = getIn(context.values, 'properties');
	//console.debug('properties', properties);

	const GLOBAL_FIELD_OBJ = {};
	//const GLOBAL_FIELD_OPTIONS = globalFields.map(({
	globalFields.forEach(({
		_id,
		//decideByType,
		enabled,
		fieldType,
		fulltext,
		includeInAllText,
		key,
		max,
		min,
		nGram,
		path
	}) => {
		GLOBAL_FIELD_OBJ[_id] = {
			//decideByType,
			enabled,
			fieldType,
			fulltext,
			includeInAllText,
			key,
			max,
			min,
			nGram,
			path
		};
		/*return {
			key: _id,
			text: key,
			value: _id
		};*/
	});

	const [showGlobalFields, setShowGlobalFields] = React.useState(false);

	const combinedList = (showGlobalFields
		? properties.concat(
			globalFields.map(({
				enabled,
				fieldType,
				fulltext,
				includeInAllText,
				key,
				max,
				min,
				nGram,
				path
			})=> ({
				enabled,
				fulltext,
				global: true,
				includeInAllText,
				name: key,
				valueType: fieldType,
				max,
				min,
				nGram,
				path
			}))
		)
		: properties).sort((a,b) => (a.name > b.name) ? 1 : -1);
	//console.debug('combinedList', combinedList);

	return <>
		<Form>
			<Form.Field>
				<Radio
					checked={showGlobalFields}
					label='Show Global Fields'
					onChange={(ignored,{checked}) => {
						setShowGlobalFields(checked);
					}}
					toggle
				/>
			</Form.Field>
		</Form>
		{showGlobalFields || combinedList.length
			? <Table celled compact selectable singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell collapsing textAlign='center'>Active</Table.HeaderCell>
						<Table.HeaderCell collapsing>Edit</Table.HeaderCell>
						<Table.HeaderCell>Field</Table.HeaderCell>
						<Table.HeaderCell collapsing>Value type</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Min</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Max</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Indexing</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Include in _allText</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Fulltext</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Ngram</Table.HeaderCell>
						<Table.HeaderCell collapsing textAlign='center'>Path</Table.HeaderCell>
						<Table.HeaderCell collapsing>Delete</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>{
					combinedList.map(({
						active = true,
						enabled,
						fulltext,
						global = false,
						includeInAllText,
						name,
						valueType,
						max,
						min,
						nGram,
						path
					}, i) => <Table.Row key={i}>
						<Table.Cell collapsing textAlign='center'>{global ? null : <Radio
							checked={active}
							onChange={(/*ignored,{checked}*/) => {}}
							toggle
						/>}</Table.Cell>
						<Table.Cell collapsing><ButtonEdit onClick={() => {}}/></Table.Cell>
						<Table.Cell disabled={global}>{name}{global ? <Icon color='grey' name='globe'/> : null}</Table.Cell>
						{/*<Table.Cell icon={{color:'grey',name:'globe'}}/>*/}
						<Table.Cell collapsing disabled={global}>{valueType}</Table.Cell>
						<Table.Cell collapsing disabled={global} textAlign='center'>{min === 0 ? null : min}</Table.Cell>
						<Table.Cell collapsing disabled={global} textAlign='center'>{max === 0 ? '∞' : max}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{active ? <Checkmark disabled checked={enabled} size='large'/> : null}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{active && enabled ? <Checkmark disabled checked={includeInAllText} size='large'/>: null}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{active && enabled ? <Checkmark disabled checked={fulltext} size='large'/>: null}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{active && enabled ? <Checkmark disabled checked={nGram} size='large'/>: null}</Table.Cell>
						<Table.Cell collapsing textAlign='center'>{active && enabled ? <Checkmark disabled checked={path} size='large'/>: null}</Table.Cell>
						<Table.Cell collapsing>{global ? null : <ButtonDelete onClick={() => {}}/>}</Table.Cell>
					</Table.Row>)
				}</Table.Body>
			</Table> : null}
		<AddOrEditLocalField
			globalFieldObj={GLOBAL_FIELD_OBJ}
		/>
	</>;
};
