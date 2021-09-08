import getIn from 'get-value';
import {Button, Dropdown, Form, Header, Icon, Table} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {setValue} from 'semantic-ui-react-form/actions';
import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';
//import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {List} from 'semantic-ui-react-form/List';
import {MoveDownButton} from 'semantic-ui-react-form/buttons/MoveDownButton';
import {MoveUpButton} from 'semantic-ui-react-form/buttons/MoveUpButton';
import {SetValueButton} from 'semantic-ui-react-form/buttons/SetValueButton';

import {fieldObjToFieldArr} from './query/fieldObjToFieldArr';


export function Facets(props) {
	const [context, dispatch] = getEnonicContext();
	const {
		disabled = false,
		fieldsObj,
		id,
		legend = null,
		levels = 2,
		name = 'facets',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		value = getIn(context.values, path)
	} = props;
	//console.debug('Facets fieldsObj', fieldsObj);
	let {
		level = 0
	} = props;
	level += 1;
	const allowChildren = level !== levels;
	//console.debug('Facets level', level, 'levels', levels, 'allowChildren', allowChildren);
	const fieldOptions = fieldObjToFieldArr(fieldsObj);
	//console.debug('Facets fieldOptions', fieldOptions);

	if (!(Array.isArray(value) && value.length)) {
		return <Form.Field id={id}>
			<SetValueButton
				disabled={disabled}
				path={path}
				value={[{
					tag: '',
					facets: []
				}]}
			><Icon className='green plus'/> Add facet(s)</SetValueButton>
		</Form.Field>;
	}

	return <>
		{legend && <Header content={legend} dividing id={id}/>}
		<List
			path={path}
			render={(facetsArray) => {
				return <Table>
					{allowChildren && <Table.Header>
						<Table.Row>
							<Table.HeaderCell>Category</Table.HeaderCell>
							<Table.HeaderCell>Value</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>}
					<Table.Body>{facetsArray.map(({
						facets,
						tag
					},index) => {
						//console.debug('Facets tag', tag, 'facets', facets);
						const key=`${path}.${index}`;
						return <Table.Row key={key}>
							<Table.Cell><Dropdown
								disabled={disabled}
								onChange={(ignoredEvent,{value: newTag}) => {
									//console.debug('Dropdown newValue', newValue);
									const newValue = {
										tag: newTag
									};
									if (allowChildren) {
										newValue.facets = [{
											tag: ''
										}];
									}
									dispatch(setValue({
										path: key,
										value: newValue
									}));
								}}
								options={fieldOptions}
								placeholder='Please select'
								value={tag}
							/></Table.Cell>
							<Table.Cell>{allowChildren && tag && fieldsObj[tag] && fieldsObj[tag].values && <Facets
								disabled={disabled}
								fieldsObj={fieldsObj[tag].values}
								legend=''
								level={level}
								levels={levels}
								parentPath={key}
							/>}</Table.Cell>
							<Table.Cell><Button.Group>
								<InsertButton
									disabled={disabled}
									path={path}
									index={index+1}
									value={{
										tag: ''
									}}
								/>
								<MoveDownButton
									disabled={disabled || index + 1 >= facetsArray.length}
									path={path}
									index={index}
								/>
								<MoveUpButton
									disabled={disabled}
									path={path}
									index={index}
								/>
								<DeleteItemButton
									disabled={disabled || facetsArray.length < 2}
									path={path}
									index={index}
								/>
							</Button.Group></Table.Cell>
						</Table.Row>;
					})}</Table.Body>
				</Table>;
			}}
		/>
	</>;
} // function Facets