import {
	Button, Form, Header, Icon, Input, Modal, Table
} from 'semantic-ui-react';

import {Form as EnonicForm} from '../enonic/Form';
import {Input as EnonicInput} from '../enonic/Input';
import {List} from '../enonic/List';
import {DeleteItemButton} from '../enonic/DeleteItemButton';
import {InsertButton} from '../enonic/InsertButton';
import {MoveDownButton} from '../enonic/MoveDownButton';
import {MoveUpButton} from '../enonic/MoveUpButton';
import {ResetButton} from '../enonic/ResetButton';
import {SortButton} from '../enonic/SortButton';
import {SubmitButton} from '../enonic/SubmitButton';
import {ValidateFormButton} from '../enonic/ValidateFormButton';


/*function required(value) {
	return value ? undefined : 'Required!';
}*/


/*function atLeastOneValue(array) {
	if (!Array.isArray(array)) return 'Must be an array!';
	if (!array.length) return 'Must have at least one item!';
	return array[0] ? undefined : 'Must have at least one item with a value!';
}*/


/*function everyItemRequired(array) {
	if (!Array.isArray(array)) return 'Must be an array!';
	if (!array.length) return 'Must have at least one item!';
	return array.map(v => required(v));
}*/


export function NewOrEditSynonym(props) {
	//console.debug('NewOrEditSynonym props', props);
	const {
		from = [''],
		id,
		onClose,
		servicesBaseUrl,
		thesaurusId,
		to = ['']
	} = props;
	const [open, setOpen] = React.useState(false);
	function doOpen() { setOpen(true); }
	function doClose() {
		onClose();
		setOpen(false);
	}
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={id ? <Button
			compact
			onClick={() => setOpen(true)}
			size='tiny'><Icon color='blue' name='edit'/> Edit synonym</Button>
			: <Button
				compact
				onClick={() => setOpen(true)}
				size='tiny'><Icon color='green' name='plus'/> New synonym</Button>
		}
	>
		<Modal.Header>{id ? `Edit synonym ${id}` : `New synonym`}</Modal.Header>
		<Modal.Content>
			<EnonicForm
				initialValues={{
					from,
					to
				}}
				onSubmit={({
					from,
					to
				}) => {
					//console.debug({from, thesaurusId, to});
					fetch(`${servicesBaseUrl}/synonym${id ? 'Modify' : 'Create'}?fromJson=${JSON.stringify(from)}${id ? `&id=${id}`: ''}&thesaurusId=${thesaurusId}&toJson=${JSON.stringify(to)}`, {
						method: 'POST'
					}).then(response => {
						doClose();
					})
				}}
			>
				{/*schema={{
					from: (array) => everyItemRequired(array),
					 //[(value) => required(value)],
					 //(array) => atLeastOneValue(array),
					to: (array) => everyItemRequired(array)
					//[(value) => required(value)]
					//(array) => atLeastOneValue(array)
				}}*/}
				<Header as='h2'>From</Header>
				<List
					path='from'
					render={(fromArray) => <>
						<Table celled compact selectable sortable striped>
							<Table.Body>{fromArray.map((fromValue, fromIndex) => {
							//console.debug('fromValue', fromValue, 'fromIndex', fromIndex);
								const fromPath = `from.${fromIndex}`;
								return <Table.Row key={fromPath}>
									<Table.Cell>
										<EnonicInput
											fluid
											path={fromPath}
											value={fromValue}
										/>
									</Table.Cell>
									<Table.Cell collapsing>
										<Button.Group>
											<InsertButton
												path='from'
												index={fromIndex}
												value={''}
											/>
											<MoveDownButton
												disabled={fromIndex + 1 >= fromArray.length}
												path='from'
												index={fromIndex}
											/>
											<MoveUpButton
												path='from'
												index={fromIndex}
											/>
											<DeleteItemButton
												disabled={fromArray.length < 2}
												path='from'
												index={fromIndex}
											/>
										</Button.Group>
									</Table.Cell>
								</Table.Row>
							})}
							</Table.Body>
						</Table>
						<InsertButton
							path='from'
							index={fromArray.length}
							value={''}
						/>
						<SortButton path='from'/>
					</>}
				/>
				<Header as='h2'>To</Header>
				<List
					path='to'
					render={(toArray) => <>
						<Table celled compact selectable sortable striped>
							<Table.Body>{toArray.map((toValue, toIndex) => {
								const toPath = `to.${toIndex}`;
								return <Table.Row key={toPath}>
									<Table.Cell>
										<EnonicInput
											fluid
											path={toPath}
											value={toValue}
										/>
									</Table.Cell>
									<Table.Cell collapsing>
										<Button.Group>
											<InsertButton
												path='to'
												index={toPath}
												value={''}
											/>
											<MoveDownButton
												disabled={toIndex + 1 >= toArray.length}
												path='to'
												index={toPath}
											/>
											<MoveUpButton
												path='to'
												index={toPath}
											/>
											<DeleteItemButton
												disabled={toArray.length < 2}
												path='to'
												index={toPath}
											/>
										</Button.Group>
									</Table.Cell>
								</Table.Row>;
							})}</Table.Body>
						</Table>
						<InsertButton
							path='to'
							index={toArray.length}
							value={''}
						/>
						<SortButton path='to'/>
					</>}
				/>
				<div style={{marginTop: 14}}>
					<SubmitButton/>
					{/*<ValidateFormButton/>*/}
					<ResetButton/>
				</div>
			</EnonicForm>
		</Modal.Content>
	</Modal>;
} // NewOrEditSynonym
