import type {DocumentTypeField} from '/lib/explorer/types/index.d';
import type {
	NewOrEditDocumentTypeComponentParams,
	NewOrEditDocumentTypeState
} from './index.d';


import {fold} from '@enonic/js-utils';
import {
	Button,
	Dimmer,
	Form,
	Icon,
	Loader,
	Modal,
	Segment,
	Tab,
	// Message,
	Radio
} from 'semantic-ui-react';
import {FieldsList} from './FieldsList';
import {useNewOrEditDocumentTypeState} from './useNewOrEditDocumentTypeState';


export function NewOrEditDocumentType({
	// Required
	documentTypes,
	servicesBaseUrl,
	setModalState,
	// Optional
	_id,
	_name,
	doClose = () => {/**/}
} :NewOrEditDocumentTypeComponentParams) {
	const {
		activeInput,
		disabled,
		error,
		isLoading,
		name,
		setActiveInput,
		setName,
		setState,
		state,
		submitDocumentForm
	} = useNewOrEditDocumentTypeState({
		_id,
		_name,
		doClose,
		documentTypes,
		servicesBaseUrl,
		setModalState
	});
	return !isLoading
		?
		<>
			<Modal.Content>
				<Tab
					defaultActiveIndex={0}
					panes={(() => {
						const panes = [];
						if (_id) {
							panes.push({
								menuItem: {
									content: 'Fields',
									icon: 'list',
									key: 'fields'
								},
								render: () => <Tab.Pane>
									<FieldsList
										collectionNames={documentTypes[_name] ? documentTypes[_name].collectionNames || [] : []}
										interfaceNames={documentTypes[_name] ? documentTypes[_name].interfaceNames || [] : []}
										servicesBaseUrl={servicesBaseUrl}
										properties={state.properties}
										updateOrDeleteProperties={
											function(
												newValues :DocumentTypeField,
												index :number
											) {
												// Uncomment if we actually want to submit the value in addOrEditLocalFieldModal
												// createOrUpdateDocument(state, () => {
												setState(prev => {
													const next :NewOrEditDocumentTypeState = JSON.parse(JSON.stringify(prev)); // deref, so state gets new object id
													if (newValues == null) {
														delete(next.properties[index]);
													} else {
														next.properties[index] = {...newValues};
													}

													/*return { // deref, so state gets new object id
														...next
													};*/
													return next;
												});
												// });
											}
										}
									/>
								</Tab.Pane>
							});
						} // if _id
						panes.push({
							menuItem: {
								content: 'Settings',
								icon: 'setting',
								key: 'settings'
							},
							render: () => <Tab.Pane>
								<Form>
									<Form.Field>
										{ _id ?
											<Form.Input
												fluid
												label="Name"
												disabled={true}
												value={_name}
											/>
											:
											<Form.Input
												fluid
												onChange={(
													//@ts-ignore
													event :unknown,
													data
												) => {
													// setName(data.value);
													setName(fold(data.value.toLowerCase()));

													if (!activeInput) {
														setActiveInput(true);
													}
												}}
												label='Name'
												path='_name'
												placeholder='Please input an unique name'
												value={name}
												error={error}
											/>
										}
									</Form.Field>
									<Form.Field>
										<Radio
											label='Add new fields automatically when creating/updating documents?'
											name='addFields'
											onChange= {(
												//@ts-ignore
												event :unknown,
												data
											) => {
												setState(prev => {
													return {
														...prev,
														addFields: data.checked
													};
												});
											}}
											toggle
											checked={state.addFields}
										/>
									</Form.Field>
								</Form>
							</Tab.Pane>
						});
						return panes;
					})()}
					renderActiveOnly={true/*For some reason everything is gone when set to false???*/}
				/>
			</Modal.Content>
			<Modal.Actions>
				{
					//TODO replace
					/* {_id ? <ResetButton floated='left' secondary/> : null} */
				}
				<Button onClick={() => doClose()}>Cancel</Button>
				<Button disabled={disabled} onClick={()=>{submitDocumentForm();}} primary>
					<Icon name='save'/>Save
				</Button>
			</Modal.Actions>
		</>
		: <>
			<Modal.Content>
				<Segment>
					<Dimmer active inverted>
						<Loader inverted>Loading</Loader>
					</Dimmer>
				</Segment>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={() => doClose()}>Cancel</Button>
			</Modal.Actions>
		</>;
} // NewOrEditDocumentType
