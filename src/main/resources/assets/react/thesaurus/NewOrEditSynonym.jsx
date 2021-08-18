import {
	Button, Header, Icon, Modal, Popup, Table
} from 'semantic-ui-react';

import {Form as EnonicForm} from 'semantic-ui-react-form/Form';
import {Input as EnonicInput} from 'semantic-ui-react-form/inputs/Input';
import {List} from 'semantic-ui-react-form/List';
import {DeleteItemButton} from 'semantic-ui-react-form/buttons/DeleteItemButton';
import {InsertButton} from 'semantic-ui-react-form/buttons/InsertButton';
import {MoveDownButton} from 'semantic-ui-react-form/buttons/MoveDownButton';
import {MoveUpButton} from 'semantic-ui-react-form/buttons/MoveUpButton';
import {ResetButton} from 'semantic-ui-react-form/buttons/ResetButton';
import {SortButton} from 'semantic-ui-react-form/buttons/SortButton';
import {SubmitButton} from 'semantic-ui-react-form/buttons/SubmitButton';
//import {ValidateFormButton} from 'semantic-ui-react-form/buttons/ValidateFormButton';

//import Snowball from 'snowball';


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
	//function doOpen() { setOpen(true); }
	function doClose() {
		setOpen(false); // This needs to be before unmount.
		onClose(); // This could trigger render in parent, and unmount this Component.
	}
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={id ? <Popup
			content={`Edit synonym`}
			inverted
			trigger={<Button
				icon
				onClick={() => setOpen(true)}
			><Icon color='blue' name='edit'/></Button>}/>
			: <Popup
				content={`New synonym`}
				inverted
				trigger={<Button
					icon
					onClick={() => setOpen(true)}
				><Icon color='green' name='plus'/></Button>}/>
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
					}).then((/*response*/) => {
						doClose();
					});
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
								</Table.Row>;
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
								//console.debug('NewOrEditSynonym toValue', toValue, 'toIndex', toIndex, 'toPath', toPath);
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
												index={toIndex}
												value={''}
											/>
											<MoveDownButton
												disabled={toIndex + 1 >= toArray.length}
												path='to'
												index={toIndex}
											/>
											<MoveUpButton
												path='to'
												index={toIndex}
											/>
											<DeleteItemButton
												disabled={toArray.length < 2}
												path='to'
												index={toIndex}
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
