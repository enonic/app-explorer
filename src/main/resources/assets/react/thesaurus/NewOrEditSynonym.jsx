import {forceArray} from '@enonic/js-utils';
import {
	Button,
	Header, Icon, Modal, Popup,
	Table,
	Segment
} from 'semantic-ui-react';

import {Checkbox as EnonicCheckbox} from 'semantic-ui-react-form/inputs/Checkbox';
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

import {LanguageDropdown} from '../collection/LanguageDropdown';
import {Panel} from './Panel';

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

const PATH_LANGUAGES = 'languages';

export function NewOrEditSynonym(props) {
	//console.debug('NewOrEditSynonym props', props);
	const {
		from = [''],
		_id,
		locales,
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
	/*const fromStemmer = new Snowball('Norwegian');
	const toStemmer = new Snowball('English');*/
	return <Modal
		closeIcon
		onClose={doClose}
		open={open}
		trigger={_id ? <Popup
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
		<Modal.Header>{_id ? `Edit synonym ${_id}` : `New synonym`}</Modal.Header>
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
				<Header as='h2'>Languages</Header>
				<List
					path={PATH_LANGUAGES}
					render={(languages) => {
						//console.debug('languages', languages);
						if (!(languages && Array.isArray(languages) && languages.length)) languages = [{
							language: 'nb-NO',
							synonyms: [{
								comment: 'Denne hjalp mange',
								enabled: true,
								synonym: 'ord eller setning'
							},{
								comment: 'Vi har funnet ut at denne bare skaper trøbbel',
								enabled: false,
								synonym: 'bla bla ukeblad'
							}]
						},{
							language: 'en-US',
							synonyms: [{
								comment: 'This one helped many',
								enabled: true,
								synonym: 'word or sentence'
							},{
								comment: 'This one only caused tons of useless results',
								enabled: false,
								synonym: 'fnord'
							}]
						}];
						languages = forceArray(languages);
						//console.debug('languages', languages);
						return <Segment.Group>{languages.map(({
							language,
							synonyms
						}, i) => {
							const pathALanguage = `languages[${i}]`;
							const pathSynonyms = `${pathALanguage}.synonyms`;
							if (!language) language = '';
							if (!synonyms) synonyms = [];
							return <Segment
								key={`panel-${i}`}
							>
								<Panel
									fluid
									title={language || 'Please select language'}
								>
									{/*<h3>Language: {language}</h3>*/}
									{language ? null : <LanguageDropdown
										disabled={!!language /* FEATURE: As soon as a language is selected, it's disabled so one cannot change language */}
										locales={locales}
										parentPath={pathALanguage}
										value={language}
									/>}
									<Table celled compact selectable sortable striped>
										<Table.Header>
											<Table.Row>
												<Table.HeaderCell>Enabled</Table.HeaderCell>
												<Table.HeaderCell>Synonym</Table.HeaderCell>
												<Table.HeaderCell>Comment</Table.HeaderCell>
												<Table.HeaderCell>Actions</Table.HeaderCell>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{(()=>{
												//console.debug('synonyms', synonyms);
												if (!(synonyms && Array.isArray(synonyms) && synonyms.length)) synonyms = [{
													comment: '',
													enabled: true,
													synonym: ''
												}];
												return synonyms.map(({
													comment,
													enabled,
													synonym
												}, j) => {
													const pathASynonym = `${pathSynonyms}[${j}]`;
													return <Table.Row key={`${i}.${j}`}>
														<Table.Cell collapsing><EnonicCheckbox
															checked={enabled}
															path={`${pathASynonym}.enabled`}
															type='radio'
															toggle
														/></Table.Cell>
														<Table.Cell><EnonicInput
															disabled={!enabled}
															fluid
															path={`${pathASynonym}.synonym`}
															value={synonym}
														/></Table.Cell>
														<Table.Cell><EnonicInput
															disabled={!enabled}
															fluid
															path={`${pathASynonym}.comment`}
															value={comment}
														/></Table.Cell>
														<Table.Cell collapsing>
															<Button.Group>
																<InsertButton
																	path={pathSynonyms}
																	index={j+1}
																	value={{
																		comment: '',
																		enabled: true,
																		synonym: ''
																	}}
																/>
																<MoveDownButton
																	disabled={j + 1 >= synonyms.length}
																	path={pathSynonyms}
																	index={j}
																/>
																<MoveUpButton
																	path={pathSynonyms}
																	index={j}
																/><DeleteItemButton
																	disabled={synonyms.length < 2}
																	path={pathSynonyms}
																	index={j}
																/>
															</Button.Group>
														</Table.Cell>
													</Table.Row>;
												});
											})()}
										</Table.Body>
										{/*<Table.Footer>
											<Table.HeaderCell colspan={4}>
												<Button.Group>
													<InsertButton
														path={pathSynonyms}
														index={synonyms.length}
														value={{
															comment: '',
															enabled: true,
															synonym: ''
														}}
													/>
												</Button.Group>
											</Table.HeaderCell>
										</Table.Footer>*/}
									</Table>
									{/*<SortButton path={pathSynonyms}/>*/}
									<Button.Group floated='right'>
										<MoveDownButton
											disabled={i + 1 >= languages.length}
											path={PATH_LANGUAGES}
											index={i}
										/>
										<MoveUpButton
											path={PATH_LANGUAGES}
											index={i}
										/>
										<DeleteItemButton
											disabled={languages.length < 2}
											icon={true}
											path={PATH_LANGUAGES}
											index={i}
										><Icon color='red' name='alternate outline trash'/> Delete language {language}</DeleteItemButton>
									</Button.Group>
									<div style={{clear:'both'}}></div>
								</Panel>
							</Segment>;
						})}
						<Segment>
							<InsertButton
								icon={false}
								index={languages.length}
								path={PATH_LANGUAGES}
								value={{
									language: '',
									synonyms: [{
										comment: '',
										enabled: true,
										synonym: ''
									}]
								}}
							><Icon color='green' name='add'/>Add language</InsertButton>
						</Segment>
						</Segment.Group>;
					}}
				/>
				<Header as='h2'>From</Header>
				<List
					path='from'
					render={(fromArray) => <>
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
					render={(toArray) => <>
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
				<div style={{marginTop: 14}}>
					<SubmitButton/>
					{/*<ValidateFormButton/>*/}
					<ResetButton/>
				</div>
			</EnonicForm>
		</Modal.Content>
	</Modal>;
} // NewOrEditSynonym
