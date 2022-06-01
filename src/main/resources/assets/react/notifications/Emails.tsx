import {getIn} from '@enonic/js-utils';
import {Button, Form, Icon, Table} from 'semantic-ui-react';
import {
	DeleteItemButton,
	Input,
	InsertButton,
	List,
	MoveDownButton,
	MoveUpButton,
	SetValueButton,
	getEnonicContext
} from '@enonic/semantic-ui-react-form';


export function Emails(props :{
	path ?:string
} = {}) {
	const {
		path = 'emails'
	} = props;
	//console.debug('path', path);

	const {state} = getEnonicContext();
	//console.debug('state', state);

	const value = getIn(state.values, path);
	//console.debug('value', value);

	if (!(Array.isArray(value) && value.length)) {
		return <Form.Field>
			<SetValueButton
				path={path}
				value={['']}
			><Icon className='green plus'/> Add email(s)</SetValueButton>
		</Form.Field>;
	}

	return <Table celled collapsing compact selectable singleLine sortable striped>
		<Table.Header>
			<Table.Row>
				<Table.HeaderCell>Email</Table.HeaderCell>
				<Table.HeaderCell>Actions</Table.HeaderCell>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			<List<string>
				path={path}
				render={(emails) => {
					//console.debug('emails', emails);
					return <>
						{emails.map((
							//@ts-ignore
							email,
							index
						) => {
							//console.debug('email', email, 'index', index);

							const key=`${path}.${index}`;
							//console.debug('email', email, 'index', index, 'key', key);

							return <Table.Row key={key}>
								<Table.Cell>
									<Input<string>
										fluid
										path={key}
										style={{
											minWidth:'25em'
										}}
										value={email}
									/>
								</Table.Cell>
								<Table.Cell>
									<Button.Group icon>
										<InsertButton
											path={path}
											index={index+1}
											value={''}
										/>
										<MoveDownButton
											disabled={index + 1 >= emails.length}
											path={path}
											index={index}
										/>
										<MoveUpButton
											path={path}
											index={index}
										/>
										<DeleteItemButton
											disabled={emails.length < 2}
											path={path}
											index={index}
										/>
									</Button.Group>
								</Table.Cell>
							</Table.Row>;
						})}
					</>;
				}}
			/>
		</Table.Body>
	</Table>;
} // Emails
