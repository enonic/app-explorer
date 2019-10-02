import getIn from 'get-value';
import {Button, Form, Table} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';
import {List} from 'semantic-ui-react-form/List';

import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {MoveDownButton} from 'semantic-ui-react-form/buttons/MoveDownButton';
import {MoveUpButton} from 'semantic-ui-react-form/buttons/MoveUpButton';

import {fieldObjToFieldArr} from './fieldObjToFieldArr';
import {OperatorSelector} from './OperatorSelector';


export function Fulltext(props) {
	const [context, dispatch] = getEnonicContext();

	const {
		fieldsObj,
		name = 'fulltext',
		legend = null,
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		thesauriOptions,
		type = 'fulltext', // ngram synonyms
		value = getIn(context.values, path)
	} = props;
	//console.debug('Fulltext path', path, 'type', type, 'value', value);
	const fieldsPath = `${path}.fields`;
	const fieldOptions = fieldObjToFieldArr(fieldsObj);
	//console.debug('Fulltext fieldOptions', fieldOptions);
	const thesauriPath = `${path}.thesauri`;
	const thesauriValue = getIn(context.values, thesauriPath, []);
	return <>
		{type === 'synonyms' && <Form.Field><Dropdown
			fluid
			multiple={true}
			options={thesauriOptions}
			path={thesauriPath}
			placeholder='Thesauri'
			search
			selection
			value={thesauriValue}
		/></Form.Field>}
		<List
			path={fieldsPath}
			render={(fieldsArray) => {
				return <Table celled collapsing compact selectable singleLine striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Field</Table.HeaderCell>
							<Table.HeaderCell>Boost</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>{fieldsArray.map(({
						boost,
						field//,
						//uuid4
					}, index) => {
						//console.debug('Fulltext boost', boost, 'field', field, 'index', index);
						const key = `${fieldsPath}.${index}`;
						return <Table.Row key={key}>
							<Table.Cell><Dropdown
								options={fieldOptions}
								path={`${key}.field`}
								value={field}
							/></Table.Cell>
							<Table.Cell><Input
								path={`${key}.boost`}
								type='number'
								value={boost}
							/></Table.Cell>
							<Table.Cell>
								<Button.Group>
									<InsertButton
										path={fieldsPath}
										index={index}
										value={{
											field: '_allText',
											boost: ''//,
											//uuid4: generateUuidv4()
										}}
									/>
									<MoveDownButton
										disabled={index + 1 >= fieldsArray.length}
										path={fieldsPath}
										index={index}
									/>
									<MoveUpButton
										path={fieldsPath}
										index={index}
									/>
									<DeleteItemButton
										disabled={fieldsArray.length < 2}
										path={fieldsPath}
										index={index}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>
					})}</Table.Body>
				</Table>;
			}}
		/>
		{type === 'synonyms' ? null : <OperatorSelector parentPath={path}/>}
	</>;

} // function Fulltext
