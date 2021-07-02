import {
	QUERY_OPERATOR_AND,
	QUERY_OPERATOR_OR
} from '@enonic/sdk';

import getIn from 'get-value';
import {Button, Divider, Form, Icon, Segment} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {MoveDownButton} from 'semantic-ui-react-form/buttons/MoveDownButton';
import {MoveUpButton} from 'semantic-ui-react-form/buttons/MoveUpButton';
import {List} from 'semantic-ui-react-form/List';

import {OperatorSelector} from './OperatorSelector';
import {QueryBuilder} from './QueryBuilder';


export function Logic(props) {
	const [context/*, dispatch*/] = getEnonicContext();
	const {
		disabled = false,
		fieldsObj,
		name = 'group',
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		thesauriOptions,
		value = getIn(context.values, path)
	} = props;
	//console.debug('Logic path', path, 'value', value);

	const expressionsPath = `${path}.expressions`;
	if (!value || !value.expressions || !Array.isArray(value.expressions) || !value.expressions.length) {
		return <Form.Field>
			<InsertButton
				disabled={disabled}
				icon={false}
				index={0}
				path={expressionsPath}
				value={{
					params: {},
					type: ''
				}}
			>
				<Icon color='green' name='add'/>Add expression
			</InsertButton>
		</Form.Field>;
	}

	return <>
		<OperatorSelector
			disabled={disabled}
			path={`${path}.operator`}
			options={[{
				value: QUERY_OPERATOR_OR,
				label: 'OR - Any of the expressions matches.'
			},{
				value: QUERY_OPERATOR_AND,
				label: 'AND - All expressions matches.'
			}]}
		/>
		<List
			path={expressionsPath}
			render={(expressionsArray) => {
				//console.debug('Logic expressionsArray', expressionsArray);
				return expressionsArray.map(({
					params,
					type
				}, index) => {
					//console.debug('Logic params', params, 'type', type, 'index', index);
					const key=`${expressionsPath}.${index}`;
					return <div key={key}>
						{index ? <Divider hidden/> : null}
						<Segment raised>
							<QueryBuilder
								disabled={disabled}
								fieldsObj={fieldsObj}
								name={index}
								parentPath={expressionsPath}
								path={key}
								thesauriOptions={thesauriOptions}
							/>
							<Button.Group floated='right'>
								<InsertButton
									disabled={disabled}
									index={index+1}
									path={expressionsPath}
									value={{
										params: {},
										type: ''
									}}
								><Icon color='green' name='add'/>{'Add expression'}</InsertButton>
								<MoveDownButton
									disabled={disabled || index === value.expressions.length - 1}
									index={index}
									path={expressionsPath}
									visible={value.expressions.length > 1}
								/>
								<MoveUpButton
									disabled={disabled}
									index={index}
									path={expressionsPath}
									visible={value.expressions.length > 1}
								/>
							</Button.Group>
							<div style={{clear: 'both'}}/>
						</Segment>
					</div>;
				});
			}}
		/>
		{value.expressions.length ? null : <InsertButton
			disabled={disabled}
			index={value.expressions.length - 1}
			path={expressionsPath}
			value={{
				params: {},
				type: ''
			}}
		><Icon color='green' name='add'/>Add expression</InsertButton>}
	</>;
} // function Logic
