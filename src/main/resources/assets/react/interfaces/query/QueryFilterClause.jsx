import getIn from 'get-value';
import {Form, Header, Icon, Table} from 'semantic-ui-react';

import {getEnonicContext} from '../../enonic/Context';
import {Dropdown} from '../../enonic/Dropdown';
import {List} from '../../enonic/List';
import {SetValueButton} from '../../enonic/SetValueButton';

import {ucFirst} from '../../utils/ucFirst';

import {QueryFilterSelector} from './QueryFilterSelector';


function fieldObjToFieldArr(obj) {
	const arr = [];
	Object.entries(obj).forEach(([k, v]) => {
		arr.push({
			key: k,
			text: v.text,
			value: k
		});
	});
	return arr;
}


export function QueryFilterClause(props) {
	const [context, dispatch] = getEnonicContext();
	//console.debug('QueryFilterClause context', context);

	const {
		fieldsObj = {},
		id,
		parentPath,
		name = 'must',
		legend = ucFirst(name),
		path = parentPath ? `${parentPath}.${name}` : name,
		value = getIn(context, `values.${path}`)
	} = props;
	console.debug('QueryFilterClause fieldsObj', fieldsObj);
	//console.debug('QueryFilterClause id', id, 'name', name, 'path', path, 'value', value);
	if(!(value && Array.isArray(value) && value.length)) {
		return <Form.Field id={id}>
			<SetValueButton
				icon={false}
				path={path}
				value={[{
					filter: 'exists',
					params: {
						field: ''
					}
				}]}
			><Icon color='green' name='plus'/> Add {name} filter(s)</SetValueButton>
		</Form.Field>;
	}
	const fieldOptions = fieldObjToFieldArr(fieldsObj);
	//console.debug('QueryFilterClause fieldOptions', fieldOptions);
	return <>
		<Header content={legend}dividing id={id}/>
		<Table celled compact selectable singleLine striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Filter</Table.HeaderCell>
					<Table.HeaderCell>Field</Table.HeaderCell>
					<Table.HeaderCell>Values</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<List
					path={path}
					render={(filtersArray) => {
						//console.debug('QueryFilterClause filtersArray', filtersArray);
						return filtersArray.map((filterItem, index) => {
							console.debug('QueryFilterClause filterItem', filterItem);
							const {
								filter,
								params: {
									field = '',
									values: fieldValues = []
								}
							} = filterItem;
							//console.debug('QueryFilterClause filter', filter, 'field', field, 'fieldValues', fieldValues, 'index', index);
							const key=`${path}.${index}`;
							//console.debug('QueryFilterClause key', key);
							return <Table.Row key={key}>
								<Table.Cell>
									<QueryFilterSelector
										parentPath={key}
										value={filter}
									/>
								</Table.Cell>
								<Table.Cell>
									{['exists', 'hasValue', 'notExists'].includes(filter)
										&& <Dropdown
											options={fieldOptions}
											path={`${key}.params.field`}
											placeholder='Please select a field'
										/>
									}
								</Table.Cell>
								<Table.Cell>
									{field && filter === 'hasValue'
										&& <Dropdown
											multiple={true}
											path={`${key}.params.values`}
											options={fieldObjToFieldArr(fieldsObj[field].values)}
											value={fieldValues}
										/>
									}
								</Table.Cell>
							</Table.Row>;
						})
					}}
				/>
			</Table.Body>
		</Table>
	</>;
} // function QueryFilterClause
