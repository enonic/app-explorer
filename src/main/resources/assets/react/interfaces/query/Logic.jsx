import getIn from 'get-value';
import {Button, Divider, Form, Icon, Segment} from 'semantic-ui-react';

import {getEnonicContext} from '../../enonic/Context';
import {InsertButton} from '../../enonic/InsertButton';
import {MoveDownButton} from '../../enonic/MoveDownButton';
import {MoveUpButton} from '../../enonic/MoveUpButton';
import {List} from '../../enonic/List';

import {OperatorSelector} from './OperatorSelector';
import {QueryBuilder} from './QueryBuilder';


export function Logic(props) {
	const [context, dispatch] = getEnonicContext();
	const {
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
				icon={false}
				index={0}
				path={expressionsPath}
				value={{
					params: {},
					type: ''//,
					//uuid4: generateUuidv4()
				}}
			>
				<Icon color='green' name='add'/>Add expression
			</InsertButton>
		</Form.Field>;
	}

	return <>
		<OperatorSelector
			path={`${path}.operator`}
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
								fieldsObj={fieldsObj}
								name={index}
								parentPath={expressionsPath}
								path={key}
								thesauriOptions={thesauriOptions}
							/>
							<Button.Group floated='right'>
								<InsertButton
									index={index+1}
									path={expressionsPath}
									value={{
										params: {},
										type: ''//,
										//uuid4: generateUuidv4()
									}}
								><Icon color='green' name='add'/>{'Add expression'}</InsertButton>
								<MoveDownButton
									disabled={index === value.expressions.length - 1}
									index={index}
									path={expressionsPath}
									visible={value.expressions.length > 1}
								/>
								<MoveUpButton
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
			index={value.expressions.length - 1}
			path={expressionsPath}
			value={{
				params: {},
				type: ''//,
				//uuid4: generateUuidv4()
			}}
		><Icon color='green' name='add'/>Add expression</InsertButton>}
	</>;
} // function Logic
