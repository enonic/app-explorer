import {connect, FieldArray, getIn} from 'formik';
import generateUuidv4 from 'uuid/v4';

import {InsertButton} from '../buttons/InsertButton';
import {MoveUpButton} from '../buttons/MoveUpButton';
import {MoveDownButton} from '../buttons/MoveDownButton';
import {RemoveButton} from '../buttons/RemoveButton';
import {SetButton} from '../buttons/SetButton';

import {Button} from '../semantic-ui/Button';
import {Buttons} from '../semantic-ui/Buttons';
import {Divider} from '../semantic-ui/Divider';
import {Field} from '../semantic-ui/Field';
import {Header} from '../semantic-ui/Header';
import {Icon} from '../semantic-ui/Icon';
import {Segment} from '../semantic-ui/Segment';
import {Segments} from '../semantic-ui/Segments';

import {OperatorSelector} from './OperatorSelector';
import {ExpressionSelector} from './ExpressionSelector';

//import {toStr} from '../utils/toStr';


export const QueryGroup = connect(({
	formik: {
		values
	},
	fields,
	name = 'group',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	thesauriOptions,
	value = values && getIn(values, path)
}) => {
	/*console.debug(toStr({
		component: 'QueryGroup',
		//fields,
		//parentPath,
		//name,
		path,
		value,
		thesauriOptions
	}));*/
	const expressionsPath = `${path}.expressions`;
	if (!value || !value.expressions || !Array.isArray(value.expressions) || !value.expressions.length) {
		return <Field>
			<InsertButton
				index={0}
				path={expressionsPath}
				text={'Add expression'}
				value={{
					params: {},
					type: '',
					uuid4: generateUuidv4()
				}}
			/>
		</Field>;
	}
	return <>
		<OperatorSelector
			parentPath={path}
		/>
		<FieldArray
			name={`${path}.expressions`}
			render={() => value.expressions.map(({uuid4}, index) => {
				return <div key={uuid4}>
					{index ? <Divider hidden/> : null}
					<Segment raised>
						<ExpressionSelector
							expressions={value.expressions}
							fields={fields}
							name={index}
							parentPath={`${path}.expressions`}
							path={`${path}.expressions[${index}]`}
							thesauriOptions={thesauriOptions}
						/>
						<Buttons right floated>
							<InsertButton
								index={index}
								path={parentPath}
								text={`${index === (value.expressions.length - 1) ? 'Add' : 'Insert '} expression`}
								value={{
									params: {},
									type: '',
									uuid4: generateUuidv4()
								}}
							/>
							<MoveDownButton
								disabled={index === value.expressions.length-1}
								index={index}
								path={parentPath}
								visible={value.expressions.length > 1}
							/>
							<MoveUpButton
								index={index}
								path={parentPath}
								visible={value.expressions.length > 1}
							/>
						</Buttons>
						<div style={{clear: 'both'}}/>
					</Segment>
				</div>;
			})}
		/>
		{value.expressions.length ? null : <InsertButton
			index={value.expressions.length - 1}
			path={expressionsPath}
			text='Add expression'
			value={{
				params: {},
				type: '',
				uuid4: generateUuidv4()
			}}
		/>}
	</>;
}); // QueryGroup
