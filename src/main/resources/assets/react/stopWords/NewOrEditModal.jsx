import {
	Button, Form, Header, Icon, Modal, Popup, Table
} from 'semantic-ui-react';

import {Form as EnonicForm} from '../enonic/Form';
import {Input as EnonicInput} from '../enonic/Input';
import {List} from '../enonic/List';

import {DeleteItemButton} from '../enonic/DeleteItemButton';
import {InsertButton} from '../enonic/InsertButton';
import {MoveDownButton} from '../enonic/MoveDownButton';
import {MoveUpButton} from '../enonic/MoveUpButton';
import {SortButton} from '../enonic/SortButton';

import {ResetButton} from '../enonic/ResetButton';
import {SubmitButton} from '../enonic/SubmitButton';


export function NewOrEditModal(props) {
	//console.debug('NewOrEditModal props', props);
	const {
		afterClose,
		displayName = '',
		name = '',
		editMode = !!name,
		header = editMode ? `Edit ${displayName} stopWords` : 'New stopWords list',
		servicesBaseUrl,
		words = ['']
	} = props;
	//console.debug('NewOrEditModal words', words);

	const [open, setOpen] = React.useState(false);

	function onClose() {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	return <Modal
		closeIcon
		onClose={onClose}
		open={open}
		trigger={<Popup
			content={header}
			inverted
			trigger={editMode ? <Button
				icon
				onClick={() => setOpen(true)}
			><Icon color='blue' name='edit'/></Button> : <Button
				circular
				color='green'
				icon
				onClick={() => setOpen(true)}
				size='massive'
				style={{
					bottom: 13.5,
					position: 'fixed',
					right: 13.5
				}}
			><Icon name='plus'/></Button>}/>
		}
	>
		<Modal.Header>{header}</Modal.Header>
		<Modal.Content>
			<EnonicForm
				initialValues={{
					displayName,
					name,
					words: JSON.parse(JSON.stringify(words)) // deref from props
				}}
				onSubmit={({
					name: submittedName,
					displayName: submittedDisplayName,
					words: submittedWords
				}) => {
					//console.debug({servicesBaseUrl, editMode, name, displayName, words});
					fetch(`${servicesBaseUrl}/stopWordsCreateOrUpdate?mode=${editMode ? 'update' : 'create'}&name=${submittedName}&displayName=${submittedDisplayName}&${submittedWords.map(w => `words=${w}`).join('&')}`, {
						method: 'POST'
					})
						.then(response => {
							onClose();
							//if (response.status === 200) {}
						})
				}}
			>
				<Form as='div'>
					{editMode ? null : <Form.Field><EnonicInput
						fluid
						label={{basic: true, content: 'Name'}}
						path='name'
						placeholder='Please input name'
					/></Form.Field>}
					<Form.Field>
						<EnonicInput
							fluid
							label={{basic: true, content: 'Display name'}}
							path='displayName'
							placeholder='Please input display name'
						/>
					</Form.Field>
					<Header as='h2'>Stop words</Header>
					<Form.Field>
						<List
							path='words'
							render={(wordsArray) => {
								//console.debug('NewOrEditModal wordsArray', wordsArray);
								return <>
									<Table celled compact selectable singleLine striped>
										<Table.Header>
											<Table.Row>
												<Table.HeaderCell>Word</Table.HeaderCell>
												<Table.HeaderCell>Actions</Table.HeaderCell>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{wordsArray.map((word, wordIndex) => {
												const wordPath = `words.${wordIndex}`; // setIn only support dot syntax, not square brackets
												//console.debug('NewOrEditModal word', word, 'wordIndex', wordIndex, 'wordPath', wordPath);
												return <Table.Row key={wordPath}>
													<Table.Cell>
														<EnonicInput
															fluid
															path={wordPath}
															placeholder='A stop word...'
															value={word}
														/>
													</Table.Cell>
													<Table.Cell collapsing>
														<Button.Group>
															<Popup
																content='Insert'
																inverted
																trigger={<InsertButton
																	path='words'
																	index={wordIndex}
																	value={''}
																/>}/>
															<Popup
																content='Move down'
																inverted
																trigger={<MoveDownButton
																	disabled={wordIndex + 1 >= wordsArray.length}
																	path='words'
																	index={wordIndex}
																/>}/>
															<Popup
																content='Move up'
																inverted
																trigger={<MoveUpButton
																	path='words'
																	index={wordIndex}
																/>}/>
															<Popup
																content='Delete'
																inverted
																trigger={<DeleteItemButton
																	disabled={wordsArray.length < 2}
																	path='words'
																	index={wordIndex}
																/>}/>
														</Button.Group>
													</Table.Cell>
												</Table.Row>;
											})}
										</Table.Body>
									</Table>
									<Popup
										content='Add'
										inverted
										trigger={<InsertButton
											path='words'
											index={wordsArray.length}
											value={''}
										/>}/>
										<Popup
											content='Sort'
											inverted
											trigger={<SortButton path='words'/>}/>
								</>;
							}}
						/>
					</Form.Field>
					<Form.Field>
						<SubmitButton/>
						<ResetButton/>
					</Form.Field>
				</Form>
			</EnonicForm>
		</Modal.Content>
	</Modal>;
} // NewOrEditModal
