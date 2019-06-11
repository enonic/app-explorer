import {connect, Field, FieldArray, getIn} from 'formik';
import generateUuidv4 from 'uuid/v4';

import {InsertButton} from '../buttons/InsertButton';
import {MoveUpButton} from '../buttons/MoveUpButton';
import {MoveDownButton} from '../buttons/MoveDownButton';
import {RemoveButton} from '../buttons/RemoveButton';

import {NumberInput} from '../elements/NumberInput';
import {Table} from '../elements/Table';
import {TextInput} from '../elements/TextInput';

import {FieldSelector} from '../fields/FieldSelector';

import {Buttons} from '../semantic-ui/Buttons';
import {Checkbox} from '../semantic-ui/Checkbox';
import {Header} from '../semantic-ui/Header';

import {ResultMappingTypeSelector} from './ResultMappingTypeSelector';


export const ResultMappings = connect(({
	formik: {
		values
	},
	fields,
	id,
	legend = null,
	name = 'resultMappings',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	value = values && getIn(values, path)
}) => {
	return <>
		<Header dividing id={id}>{legend}</Header>
		<Table headers={['Field', 'To', 'Type', 'Options', 'Action(s)']}>
			<FieldArray
				name={path}
				render={() => value
					.map(({
						field = '',
						highlight = false,
						join = true,
						lengthLimit = '',
						separator = ' ',
						to = '',
						uuid4 = generateUuidv4()
					}, index) => {
						const pathWithIndex = `${path}[${index}]`;
						const typePath = `${pathWithIndex}.type`;
						const type = getIn(values, typePath, 'string');
						return <tr key={uuid4}>
							<td><FieldSelector
								fields={fields}
								parentPath={pathWithIndex}
							/></td>
							<td><Field
								name={`${pathWithIndex}.to`}
								value={to}
							/></td>
							<td><ResultMappingTypeSelector
								path={typePath}
								value={type}
							/></td>
							<td>
								{type === 'string' ? <>
									<Checkbox
										checked={join}
										label="Join if array?"
										name={`${pathWithIndex}.join`}
									/>
									{join ? <TextInput
										label='Separator'
										path={`${pathWithIndex}.separator`}
										placeholder='separator'
										value={separator}
									/> : null}
									<Checkbox
										checked={highlight}
										label="Highlight?"
										name={`${pathWithIndex}.highlight`}
									/>
									<NumberInput
										label="Limit length to"
										path={`${pathWithIndex}.lengthLimit`}
										value={lengthLimit}
									/>
								</> : null}
							</td>
							<td>
								<Buttons icon>
									<InsertButton index={index} path={path} value={{
										field: '',
										highlight: false,
										lengthLimit: '',
										to: '',
										uuid4: generateUuidv4() // Might not be needed
									}}/>
									<RemoveButton index={index} path={path} visible={value.length > 1}/>
									<MoveDownButton disabled={index === value.length-1} index={index} path={path} visible={value.length > 1}/>
									<MoveUpButton index={index} path={path} visible={value.length > 1}/>
								</Buttons>
							</td>
						</tr>;
					})}
			/>
		</Table>
	</>;
}); // ResultMappings
