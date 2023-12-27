import * as React from 'react';
import {
	Button,
	Form,
	Header,
	Icon,
	Input,
	Message,
	Table
} from 'semantic-ui-react';
import {DeleteItemButton} from '../components/DeleteItemButton';
import {InsertButton} from '../components/InsertButton';
import HoverButton from '../components/buttons/HoverButton';
import {MoveDownButton} from '../components/MoveDownButton';
import {MoveUpButton} from '../components/MoveUpButton';

export function Excludes({
	excludesArray,
	setExcludesArray
}: {
	excludesArray: string[]
	setExcludesArray: (excludesArray: string[]) => void
}) {
	const [showHelp, setShowHelp] = React.useState(false);

	if (!excludesArray || !Array.isArray(excludesArray) || !excludesArray.length) {
		return <Form.Field>
			<Button
				onClick={() => {
					setExcludesArray(['']);
				}}
			>
				<Icon color='green' name='plus'/>Add exclude pattern(s)
			</Button>
		</Form.Field>
	}

	return <>
		<Header as='h4' content='Exclude pattern(s)' dividing/>
		<Table attached={showHelp ? 'top' : undefined} celled compact selectable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell collapsing>Regular expression</Table.HeaderCell>
					<Table.HeaderCell collapsing>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>{excludesArray.map((
				exclude = '',
				index
			) => {
				return <Table.Row key={index}>
					<Table.Cell>
						<Form.Group inline>
							<Form.Field width={15}>
								<Input
									fluid
									onChange={(_event,{value}) => {
										const deref = JSON.parse(JSON.stringify(excludesArray));
										deref[index] = value;
										setExcludesArray(deref);
									}}
									placeholder='^/some/path.*$'
									value={exclude}
								/>
							</Form.Field>
							<Form.Field width={1}>
								<HoverButton
									color='blue'
									icon='help'
									onClick={() => setShowHelp(!showHelp)}
								/>
								</Form.Field>
						</Form.Group>
					</Table.Cell>
					<Table.Cell collapsing>
						<Button.Group>
							<InsertButton
								array={excludesArray}
								insertAtIndex={index + 1}
								setArrayFunction={setExcludesArray}
								valueToInsert=''
							/>
							<MoveDownButton
								array={excludesArray}
								index={index}
								setArrayFunction={setExcludesArray}
							/>
							<MoveUpButton
								array={excludesArray}
								index={index}
								setArrayFunction={setExcludesArray}
							/>
							<DeleteItemButton
								array={excludesArray}
								disabled={false}
								index={index}
								setArrayFunction={setExcludesArray}
							/>
						</Button.Group>
					</Table.Cell>
				</Table.Row>;
			})}</Table.Body>
		</Table>
		{showHelp ? <Message attached='bottom' info>
			<Icon name='help' />
			The regular expression is using the string format without any flags, and is matched against URL(s) without the scheme and domain.
		</Message> : null
		}
	</>;
}
