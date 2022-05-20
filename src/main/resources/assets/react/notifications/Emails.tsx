import {getIn} from '@enonic/js-utils';
import {Button, Form, Icon, Table} from 'semantic-ui-react';
import {
	DeleteItemButton,
	Input,
	InsertButton,
	List,
	MoveDownButton,
	MoveUpButton,
	SetValueButton
	//@ts-ignore
} from 'semantic-ui-react-form';
//@ts-ignore
import {getEnonicContext} from 'semantic-ui-react-form/Context';


export function Emails(props :{
	path ?:string
} = {}) {
	const {
		path = 'emails'
	} = props;
	const [context/*, dispatch*/] = getEnonicContext();
	const value = getIn(context.values, path);

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
			<List
				path={path}
				render={(emails :Array<string>) => {
					return emails.map((
						//@ts-ignore
						email,
						index
					) => {
						const key=`${path}.${index}`;
						return <Table.Row key={key}>
							<Table.Cell>
								<Input
									fluid
									path={key}
									style={{minWidth:'25em'}}
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
					});
				}}
			/>
		</Table.Body>
	</Table>;
} // Emails
