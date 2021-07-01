import {
	LANGUAGES,
	QUERY_FUNCTION_STEMMED
} from '@enonic/sdk';

import {Button, Table} from 'semantic-ui-react';

import {Dropdown} from 'semantic-ui-react-form/inputs/Dropdown';
import {Input} from 'semantic-ui-react-form/inputs/Input';
import {List} from 'semantic-ui-react-form/List';

import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {MoveDownButton} from 'semantic-ui-react-form/buttons/MoveDownButton';
import {MoveUpButton} from 'semantic-ui-react-form/buttons/MoveUpButton';

import {LanguageDropdown} from '../../collection/LanguageDropdown';
import {fieldObjToFieldArr} from './fieldObjToFieldArr';
import {OperatorSelector} from './OperatorSelector';


const LOCALES = LANGUAGES.map(({
	code: tag,
	language: displayName
}) => ({
	country: tag === 'da' && 'dk'
	|| tag === 'el' && 'gr'
	|| tag === 'hi' && 'in'
	|| tag === 'hy' && 'am'
	|| tag === 'ja' && 'jp'
	|| tag === 'ko' && 'kr'
	|| tag === 'pt-br' && 'br'
	|| tag === 'zh' && 'cn'
	|| tag,
	displayName,
	tag
}));


export function Stemmed(props) {
	const {
		disabled = false,
		fieldsObj,
		name = QUERY_FUNCTION_STEMMED,
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name
	} = props;
	const fieldsPath = `${path}.fields`;
	const fieldOptions = fieldObjToFieldArr(fieldsObj);
	return <>
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
						field
					}, index) => {
						const key = `${fieldsPath}.${index}`;
						return <Table.Row key={key}>
							<Table.Cell><Dropdown
								disabled={disabled}
								options={fieldOptions}
								path={`${key}.field`}
								value={field}
							/></Table.Cell>
							<Table.Cell><Input
								disabled={disabled}
								path={`${key}.boost`}
								type='number'
								value={boost}
							/></Table.Cell>
							<Table.Cell>
								<Button.Group>
									<InsertButton
										disabled={disabled}
										path={fieldsPath}
										index={index}
										value={{
											field: '', // The _allText field doesn't suport stemming yet.
											boost: ''
										}}
									/>
									<MoveDownButton
										disabled={disabled || index + 1 >= fieldsArray.length}
										path={fieldsPath}
										index={index}
									/>
									<MoveUpButton
										disabled={disabled}
										path={fieldsPath}
										index={index}
									/>
									<DeleteItemButton
										disabled={disabled || fieldsArray.length < 2}
										path={fieldsPath}
										index={index}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}</Table.Body>
				</Table>;
			}}
		/>
		<OperatorSelector
			disabled={disabled}
			parentPath={path}
		/>
		<LanguageDropdown
			disabled={disabled}
			locales={LOCALES}
			parentPath={path}
		/>
	</>;
} // function Fulltext
