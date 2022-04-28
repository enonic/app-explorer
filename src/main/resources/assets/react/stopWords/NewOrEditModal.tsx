import * as React from 'react';
import {
	Button, Form, Header, Icon, Modal, Popup, Table
} from 'semantic-ui-react';

//@ts-ignore
import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
//@ts-ignore
import {Input as EnonicInput} from 'semantic-ui-react-form/inputs/Input';
//@ts-ignore
import {List} from 'semantic-ui-react-form/List';
//@ts-ignore
import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';
//@ts-ignore
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
//@ts-ignore
import {MoveDownButton} from 'semantic-ui-react-form/buttons/MoveDownButton';
//@ts-ignore
import {MoveUpButton} from 'semantic-ui-react-form/buttons/MoveUpButton';
//@ts-ignore
import {SortButton} from 'semantic-ui-react-form/buttons/SortButton';
//@ts-ignore
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
//@ts-ignore
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';


import {fetchStopWordsCreate} from '../../../services/graphQL/fetchers/fetchStopWordsCreate';
import {fetchStopWordsUpdate} from '../../../services/graphQL/fetchers/fetchStopWordsUpdate';


export function NewOrEditModal(props :{
	// Required
	servicesBaseUrl :string
	// Optional
	afterClose? :()=>void
	beforeOpen? :()=>void
	_id? :string
	_name? :string
	editMode? :boolean
	header? :string
	words? :Array<string>
}) {
	//console.debug('NewOrEditModal props', props);
	const {
		afterClose = () => {},
		beforeOpen = () => {},
		_id,
		_name = '',
		editMode = !!_name,
		header = editMode ? `Edit ${_name} stopWords` : 'New stopWords list',
		servicesBaseUrl,
		words = ['']
	} = props;
	//console.debug('NewOrEditModal words', words);

	const [open, setOpen] = React.useState(false);

	function doClose() {
		setOpen(false); // This needs to be before unmount.
		afterClose(); // This could trigger render in parent, and unmount this Component.
	}

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setOpen(true);
	};

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		trigger={<Popup
			content={header}
			inverted
			trigger={editMode ? <Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='edit'/></Button> : <Button
				circular
				color='green'
				icon
				onClick={doOpen}
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
		<EnonicForm
			initialValues={{
				_name,
				words: JSON.parse(JSON.stringify(words)) // deref from props
			}}
			onSubmit={({
				_name: submittedName,
				words: submittedWords
			}) => {
				const handleResponse = (/*response*/) => {
					doClose();
				};
				const url = `${servicesBaseUrl}/graphQL`;
				if (editMode) {
					fetchStopWordsUpdate({
						handleResponse,
						url,
						variables: {
							_id,
							words: submittedWords
						}
					})
				} else {
					fetchStopWordsCreate({
						handleResponse,
						url,
						variables: {
							_name :submittedName,
							words :submittedWords
						}
					})
				}
			}}
		>
			<Modal.Content>
				<Form as='div'>
					{editMode ? null : <Form.Field><EnonicInput
						fluid
						label={{basic: true, content: 'Name'}}
						path='_name'
						placeholder='Please input name'
					/></Form.Field>}
					<Header as='h2'>Stop words</Header>
					<Form.Field>
						<List
							path='words'
							render={(wordsArray :Array<string>) => {
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
				</Form>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={doClose}>Cancel</Button>
				<ResetButton secondary/>
				<SubmitButton primary><Icon name='save'/>Save</SubmitButton>
			</Modal.Actions>
		</EnonicForm>
	</Modal>;
} // NewOrEditModal
