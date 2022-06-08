import {
	Button,
	Form,
	Icon,
	Input,
	Table
} from 'semantic-ui-react';
import {DeleteItemButton} from '../components/DeleteItemButton';
import {InsertButton} from '../components/InsertButton';
import {MoveDownButton} from '../components/MoveDownButton';
import {MoveUpButton} from '../components/MoveUpButton';


export function Emails({
	setEmails,
	isLoading = false,
	emails = []
} :{
	setEmails :(emails :Array<string>) => void
	emails ?:Array<string>
	isLoading ?:boolean
}) {
	if (!(Array.isArray(emails) && emails.length)) {
		return <Form.Field>
			<Button
				onClick={() => setEmails([''])}
			><Icon className='green plus'/> Add email(s)</Button>
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
			{emails.map((
				//@ts-ignore
				email,
				index
			) => <Table.Row key={index}>
				<Table.Cell>
					<Input
						fluid
						disabled={isLoading}
						loading={isLoading}
						onChange={(_e,{value:newEmail}) => {
							const deref = JSON.parse(JSON.stringify(emails));
							deref[index] = newEmail;
							setEmails(deref);
						}}
						style={{
							minWidth:'25em'
						}}
						value={email}
					/>
				</Table.Cell>
				<Table.Cell>
					<Button.Group icon>
						<InsertButton
							array={emails}
							disabled={isLoading}
							insertAtIndex={index + 1}
							loading={isLoading}
							setArrayFunction={setEmails}
							valueToInsert={''}
						/>
						<MoveDownButton
							array={emails}
							disabled={isLoading || index + 1 >= emails.length}
							index={index}
							loading={isLoading}
							setArrayFunction={setEmails}
						/>
						<MoveUpButton
							array={emails}
							disabled={isLoading || index === 0}
							index={index}
							loading={isLoading}
							setArrayFunction={setEmails}
						/>
						<DeleteItemButton
							array={emails}
							disabled={isLoading || emails.length < 2}
							index={index}
							loading={isLoading}
							setArrayFunction={setEmails}
						/>
					</Button.Group>
				</Table.Cell>
			</Table.Row>
			)}
		</Table.Body>
	</Table>;
} // Emails
