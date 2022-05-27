import * as React from 'react';
import {
	Button,
	Header, Icon, Modal, Popup,
	Table
} from 'semantic-ui-react';


import {
	Form as EnonicForm,
	Input as EnonicInput,
	List,
	DeleteItemButton,
	InsertButton,
	MoveDownButton,
	MoveUpButton,
	ResetButton,
	SortButton,
	SubmitButton,
	//ValidateFormButton
} from '@enonic/semantic-ui-react-form';


// NOTE: Must resolve transpile- and bundle- time.
import {GQL_MUTATION_CREATE_SYNONYM} from '../../../services/graphQL/synonym/mutationCreateSynonym';
import {GQL_MUTATION_UPDATE_SYNONYM} from '../../../services/graphQL/synonym/mutationUpdateSynonym';


//import Snowball from 'snowball';

/* Snowball languages
da: 'Danish',
nl: 'Dutch',
en: 'English',
fi: 'Finnish',
fr: 'French',
de: 'German',
hu: 'Hungarian',
it: 'Italian',
no: 'Norwegian',
pt: 'Portuguese',
ro: 'Romanian',
ru: 'Russian',
es: 'Spanish',
sv: 'Swedish',
tr: 'Turkish'
*/

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
		_id,
		afterClose = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
		beforeOpen = () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
		from = [''],
		//locales,
		servicesBaseUrl,
		thesaurusId,
		to = ['']
	} = props;

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

	/*const fromStemmer = new Snowball('Norwegian');
	const toStemmer = new Snowball('English');*/
	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={open}
		trigger={_id ? <Popup
			content={`Edit synonym`}
			inverted
			trigger={<Button
				icon
				onClick={doOpen}
			><Icon color='blue' name='edit'/></Button>}/>
			: <Popup
				content={`New synonym`}
				inverted
				trigger={<Button
					icon
					onClick={doOpen}
				><Icon color='green' name='plus'/></Button>}/>
		}
	>
		<Modal.Header>{_id ? `Edit synonym ${_id}` : `New synonym`}</Modal.Header>
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
				fetch(`${servicesBaseUrl}/graphQL`, {
					method: 'POST',
					headers: {
						'Content-Type':	'application/json'
					},
					body: JSON.stringify({
						query: _id ? GQL_MUTATION_UPDATE_SYNONYM : GQL_MUTATION_CREATE_SYNONYM,
						variables: {
							_id,
							from,
							thesaurusId,
							to
						}
					})
				}).then((/*response*/) => {
					//if (response.status === 200) {doClose();}
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
			<Modal.Content>
				<Header as='h2'>From</Header>
				<List
					path='from'
					render={(fromArray :Array<string>) => <>
						<Table celled compact selectable sortable striped>
							{/*<Table.Header>
								<Table.Row>
									<Table.HeaderCell>Word</Table.HeaderCell>
									<Table.HeaderCell>Stem</Table.HeaderCell>
									<Table.HeaderCell>Actions</Table.HeaderCell>
								</Table.Row>
							</Table.Header>
							*/}
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
									{/*<Table.Cell>
										{fromValue.split(' ').map(w => {
											fromStemmer.setCurrent(w);
											fromStemmer.stem();
											return fromStemmer.getCurrent();
										}).filter((x, i, a) => !i || x != a[i-1]).join(' ')}
									</Table.Cell>*/}
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
					render={(toArray :Array<string>) => <>
						<Table celled compact selectable sortable striped>
							{/*<Table.Header>
								<Table.Row>
									<Table.HeaderCell>Word</Table.HeaderCell>
									<Table.HeaderCell>Stem</Table.HeaderCell>
									<Table.HeaderCell>Actions</Table.HeaderCell>
								</Table.Row>
							</Table.Header>*/}
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
									{/*<Table.Cell>
										{toValue.split(' ').map(w => {
											toStemmer.setCurrent(w);
											toStemmer.stem();
											return toStemmer.getCurrent();
										}).filter((x, i, a) => !i || x != a[i-1]).join(' ')}
									</Table.Cell>*/}
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
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={doClose}>Cancel</Button>
				<ResetButton secondary/>
				<SubmitButton primary><Icon name='save'/>Save</SubmitButton>
			</Modal.Actions>
		</EnonicForm>
	</Modal>;
} // NewOrEditSynonym
