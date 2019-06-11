import {connect, FieldArray, getIn} from 'formik';

import {InsertButton} from '../../buttons/InsertButton';
import {MoveUpButton} from '../../buttons/MoveUpButton';
import {MoveDownButton} from '../../buttons/MoveDownButton';
import {RemoveButton} from '../../buttons/RemoveButton';
import {SetButton} from '../../buttons/SetButton';

import {TextInput} from '../../elements/TextInput';
import {Table} from '../../elements/Table';

import {isSet} from '../../utils/isSet';
import {toStr} from '../../utils/toStr';
import {ucFirst} from '../../utils/ucFirst';

import {FieldSelector} from '../../fields/FieldSelector';
import {TagSelector} from '../../fields/TagSelector';

import {Buttons} from '../../semantic-ui/Buttons';
import {Field} from '../../semantic-ui/Field';
import {Header} from '../../semantic-ui/Header';
import {Icon} from '../../semantic-ui/Icon';

import {QueryFilterSelector} from './QueryFilterSelector';


export const QueryFilterClause = connect(({
	fields = {},
	id,
	formik: {
		values
	},
	parentPath,
	name = 'must',
	legend = ucFirst(name),
	path = parentPath ? `${parentPath}.${name}` : name,
	value = getIn(values, path)
}) => {
	//console.debug(toStr({component: 'QueryFilterClause', parentPath, name, path, value}));
	if(!(value && Array.isArray(value) && value.length)) {
		return <Field id={id}>
			<SetButton
				path={path}
				value={[{
					filter: 'exists',
					params: {
						field: ''
					}
				}]}
			><Icon className='green plus'/> Add {name} filter(s)</SetButton>
		</Field>;
	}
	return <>
		<Header dividing id={id}>{legend}</Header>
		<Table headers={['Filter', 'Field', 'Values']}>
			<FieldArray
				name={path}
				render={() => value.map(({
					filter,
					params: {
						field = '',
						values: fieldValues = []
					}}, index) => {
					const key=`${path}[${index}]`;
					//console.debug(toStr({component: 'QueryFilterClause', filter, field, values, index, key}));
					return <tr key={key}>
						<td>
							<QueryFilterSelector
								parentPath={key}
								value={filter}
							/>
						</td>
						<td>{['exists', 'hasValue', 'notExists'].includes(filter)
							? <FieldSelector
								fields={fields}
								parentPath={`${key}.params`}
							/>
							: null
						}</td>
						<td>{field && filter === 'hasValue'
							? <TagSelector
								multiple={true}
								path={`${key}.params.values`}
								tags={fields[field].values}
								value={fieldValues}
							/>
							: null
						}{filter === 'ids'
							? <TextInput
								path={`${key}.params.values`}
								size={Math.max(30, fieldValues.length)}
								value={fieldValues}
							/>
							: null
						}</td>
						<td>
							<Buttons icon>
								<InsertButton
									index={index}
									path={path}
									value={{
										filter: 'exists',
										params: {
											field: ''
										}
									}}
								/>
								<RemoveButton
									index={index}
									path={path}
								/>
								<MoveDownButton
									disabled={index === value.length-1}
									index={index}
									path={path}
									visible={value.length > 1}
								/>
								<MoveUpButton
									index={index}
									path={path}
									visible={value.length > 1}
								/>
							</Buttons>
						</td>
					</tr>;
				})}
			/>
		</Table>
	</>;
});
