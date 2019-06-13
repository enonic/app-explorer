import {connect, FieldArray, getIn} from 'formik';
import generateUuidv4 from 'uuid/v4';

import {Button, Form, Segment} from 'semantic-ui-react';

import {
	InsertButton,
	MoveDownButton,
	MoveUpButton,
	RemoveButton
} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';

import {SetButton} from '../buttons/SetButton';

import {Divider} from '../semantic-ui/Divider';

import {OperatorSelector} from './OperatorSelector';
import {ExpressionSelector} from './ExpressionSelector';

//import {toStr} from '../utils/toStr';


export const QueryGroup = connect(({
	formik,
	fields,
	name = 'group',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	thesauriOptions,
	value = formik.values && getIn(formik.values, path)
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
		return <Form.Field>
			<InsertButton
				formik={formik}
				index={0}
				path={expressionsPath}
				text={'Add expression'}
				value={{
					params: {},
					type: '',
					uuid4: generateUuidv4()
				}}
			/>
		</Form.Field>;
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
						<Button.Group floated='right'>
							<InsertButton
								formik={formik}
								index={index}
								path={expressionsPath}
								text={`${index === (value.expressions.length - 1) ? 'Add' : 'Insert '} expression`}
								value={{
									params: {},
									type: '',
									uuid4: generateUuidv4()
								}}
							/>
							<MoveDownButton
								formik={formik}
								disabled={index === value.expressions.length-1}
								index={index}
								path={expressionsPath}
								visible={value.expressions.length > 1}
							/>
							<MoveUpButton
								formik={formik}
								index={index}
								path={expressionsPath}
								visible={value.expressions.length > 1}
							/>
						</Button.Group>
						<div style={{clear: 'both'}}/>
					</Segment>
				</div>;
			})}
		/>
		{value.expressions.length ? null : <InsertButton
			formik={formik}
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
