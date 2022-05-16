import type {Locales} from '../index.d';


import {forceArray} from '@enonic/js-utils';
import {
	Button,
	Header, Icon,
	Table,
	Segment
} from 'semantic-ui-react';
//@ts-ignore
import {Checkbox as EnonicCheckbox} from 'semantic-ui-react-form/inputs/Checkbox';
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
import {LanguageDropdown} from '../collection/LanguageDropdown';
import {Panel} from './Panel';


const ENABLE_EXPERIMENTAL_GUI = false;
const PATH_LANGUAGES = 'languages';


export function Languages({
	locales
} :{
	locales :Locales
}) {
	return ENABLE_EXPERIMENTAL_GUI
		? <>
			<Header as='h2'>Languages</Header>
			<List
				path={PATH_LANGUAGES}
				render={(languages :Array<{
					language :string
					synonyms :Array<{
						comment :string
						enabled :boolean
						synonym :string
					}>
				}>) => {
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
		</>
		: null;
}
