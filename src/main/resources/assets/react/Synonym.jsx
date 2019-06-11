import {FieldArray, Formik} from 'formik';
import {
	 Button, Form, Grid, Header, Icon
} from 'semantic-ui-react';


import {InsertButton} from './buttons/InsertButton';
import {MoveUpButton} from './buttons/MoveUpButton';
import {MoveDownButton} from './buttons/MoveDownButton';
import {RemoveButton} from './buttons/RemoveButton';


import {TextInput} from './formik/TextInput';

//import {toStr} from './utils/toStr';


export const Synonym = ({
	action,
	from = [''],
	secondaryAction,
	to = ['']
}) => {
	//console.debug(toStr({action, from, t}));
	return <Formik
		initialValues={{action, from, secondaryAction, to}}
		render={({
			values: {
				action,
				from,
				secondaryAction,
				to
			}
		}) => {
			//console.debug(toStr({action, from, to}));
			return <Form action={action} method='POST'>
				<Grid>
					<Grid.Row>
						<Grid.Column width={16}>
							<Form.Field>
								<Header as='h1'>{secondaryAction === 'new' ? 'New' : 'Edit'} synonym</Header>
							</Form.Field>
						</Grid.Column>
					</Grid.Row>
					<Grid.Row>
      					<Grid.Column width={8}>
							<Header as='h2' dividing>From</Header>
							<FieldArray
								name='from'
								render={() => from.map((f, index) => {
									const key = `from[${index}]`;
									return <Form.Group key={key}>
										<Form.Field>
											<TextInput path={key}/>
										</Form.Field>
										<Form.Field>
											<Button.Group icon>
												<InsertButton
													index={index}
													path='from'
													value={''}
												/>
												<RemoveButton
													index={index}
													path='from'
													visible={from.length > 1}
												/>
												<MoveDownButton
													disabled={index === from.length-1}
													index={index}
													path='from'
													visible={from.length > 1}
												/>
												<MoveUpButton
													index={index}
													path='from'
													visible={from.length > 1}
												/>
											</Button.Group>
										</Form.Field>
									</Form.Group>;
								})}
							/>
						</Grid.Column>
      					<Grid.Column width={8}>
							<Header as='h2' dividing>To</Header>
							<FieldArray
								name='to'
								render={() => to.map((f, index) => {
									const key = `to[${index}]`;
									return <Form.Group key={key}>
										<Form.Field>
											<TextInput path={key}/>
										</Form.Field>
										<Form.Field>
											<Button.Group icon>
												<InsertButton
													index={index}
													path='to'
													value={''}
												/>
												<RemoveButton
													index={index}
													path='to'
													visible={to.length > 1}
												/>
												<MoveDownButton
													disabled={index === to.length-1}
													index={index}
													path='to'
													visible={to.length > 1}
												/>
												<MoveUpButton
													index={index}
													path='to'
													visible={to.length > 1}
												/>
											</Button.Group>
										</Form.Field>
									</Form.Group>;
								})}
							/>
						</Grid.Column>
					</Grid.Row>
					<Grid.Row>
      					<Grid.Column width={16}>
							<Form.Field>
								<Button primary><Icon name='save'/>{secondaryAction === 'new' ? 'Create' : 'Update'} synonym</Button>
							</Form.Field>
						</Grid.Column>
					</Grid.Row>
				</Grid>
			</Form>;
		}}
	/>;
} // Synonym
