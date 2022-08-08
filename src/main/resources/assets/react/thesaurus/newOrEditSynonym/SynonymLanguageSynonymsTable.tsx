import type {
	SynonymGUI,
	SynonymGUI_LanguagesSynonymObject,
	SynonymUse
} from '/lib/explorer/types/Synonym.d';
import type {Locales} from '../../index.d';


//import {isSet} from '@enonic/js-utils';
import {
	Form,
	Table
} from 'semantic-ui-react';
import {LanguageDropdown} from '../../collection/LanguageDropdown';
import {DeleteItemButton} from '../../components/DeleteItemButton';
//import {MoveDownButton} from '../../components/MoveDownButton';
//import {MoveUpButton} from '../../components/MoveUpButton';


export function SynonymLanguageSynonymsTable({
	interfaceOptions,
	languageIndex,
	locales,
	setState,
	state
} :{
	locales :Locales
	interfaceOptions :Array<unknown> // TODO
	languageIndex :number
	setState :React.Dispatch<React.SetStateAction<SynonymGUI>>
	state :SynonymGUI
}) {
	const localesInLanguages = [];
	const localeToIndex = {};
	for (let i = 0; i < state.languages.length; i++) {
		const {locale} = state.languages[i];
		localesInLanguages.push(locale);
		localeToIndex[locale] = i;
	}
	//console.debug('localesInLanguages', localesInLanguages);
	//console.debug('localeToIndex', localeToIndex);
	const filteredLocaleOptions = locales.filter(({tag}) => localesInLanguages.includes(tag))

	return <Table celled compact striped>
		<Table.Header>
			<Table.Row>
				<Table.HeaderCell>Enabled</Table.HeaderCell>
				<Table.HeaderCell>Synonym</Table.HeaderCell>
				<Table.HeaderCell>Use</Table.HeaderCell>
				<Table.HeaderCell>Comment</Table.HeaderCell>
				<Table.HeaderCell>Disabled in interfaces</Table.HeaderCell>
				<Table.HeaderCell>Language</Table.HeaderCell>
				<Table.HeaderCell>Actions</Table.HeaderCell>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{state.languages[languageIndex].synonyms.map((_, j) => <Table.Row key={j}>
				<Table.Cell collapsing>
					<Form.Checkbox
						checked={state.languages[languageIndex].synonyms[j].enabled}
						disabled={!state.enabled || !state.languages[languageIndex].enabled}
						onChange={(_e, {checked}) => setState(prev => {
							const deref = JSON.parse(JSON.stringify(prev));
							deref.languages[languageIndex].synonyms[j].enabled = checked;
							return deref;
						})}
						toggle
					/>
				</Table.Cell>
				<Table.Cell>
					<Form.Input
						disabled={!state.enabled || !state.languages[languageIndex].enabled || !state.languages[languageIndex].synonyms[j].enabled}
						fluid
						onChange={(_e, {value}) => setState(prev => {
							const deref = JSON.parse(JSON.stringify(prev));
							deref.languages[languageIndex].synonyms[j].synonym = value;
							return deref;
						})}
						value={state.languages[languageIndex].synonyms[j].synonym}
					/>
				</Table.Cell>
				<Table.Cell>
					<Form.Dropdown
						disabled={!state.enabled || !state.languages[languageIndex].enabled || !state.languages[languageIndex].synonyms[j].enabled}
						fluid
						onChange={(_e,{value}) => setState(prev => {
							const deref :SynonymGUI = JSON.parse(JSON.stringify(prev));
							deref.languages[languageIndex].synonyms[j].use = value as SynonymUse;
							return deref;
						})}
						options={[{
							content: "From (Used to find synonyms. Not added to main query!)",
							text: 'From',
							value: 'from'
						},{
							content: 'To (Added to main query. Not used to find synonyms!)',
							text: 'To',
							value: 'to'
						},{
							content: 'Both (Used to find synonyms, also added to main query.)',
							text: 'Both',
							value: 'both'
						}]}
						search
						selection
						value={state.languages[languageIndex].synonyms[j].use}
					/>
				</Table.Cell>
				<Table.Cell>
					<Form.Input
						disabled={!state.enabled || !state.languages[languageIndex].enabled || !state.languages[languageIndex].synonyms[j].enabled}
						fluid
						onChange={(_e, {value}) => setState(prev => {
							const deref = JSON.parse(JSON.stringify(prev));
							deref.languages[languageIndex].synonyms[j].comment = value;
							return deref;
						})}
						value={state.languages[languageIndex].synonyms[j].comment}
					/>
				</Table.Cell>
				<Table.Cell>
					<Form.Dropdown
						clearable
						disabled={!state.enabled || !state.languages[languageIndex].enabled || !state.languages[languageIndex].synonyms[j].enabled}
						fluid
						multiple
						onChange={(_e,{value}) => setState(prev => {
							const deref :SynonymGUI = JSON.parse(JSON.stringify(prev));
							deref.languages[languageIndex].synonyms[j].disabledInInterfaces = value as Array<string>;
							return deref;
						})}
						options={interfaceOptions}
						search
						selection
						value={state.languages[languageIndex].synonyms[j].disabledInInterfaces}
					/>
				</Table.Cell>
				<Table.Cell>
					<LanguageDropdown
						clearable={false}
						includeANoneOption={false}
						locales={filteredLocaleOptions}
						language={state.languages[languageIndex].locale}
						setLanguage={(value) => setState(prev => {
							//console.debug('setLanguage', value);
							const deref :SynonymGUI = JSON.parse(JSON.stringify(prev));
							deref.languages[localeToIndex[value as string]].synonyms.push(
								deref.languages[languageIndex].synonyms[j]
							);
							deref.languages[languageIndex].synonyms.splice(j,1);
							return deref;
						})}
					/>
				</Table.Cell>
				<Table.Cell collapsing>
					{/*
					<Button.Group>
							<InsertButton
							array={state.languages[languageIndex].synonyms}
							setArrayFunction={(changedArray :Array<SynonymLanguagesSynonymObject<'Array'>>) => setState(prev => {
								const deref :SynonymGUIState = JSON.parse(JSON.stringify(prev));
								deref.languages[languageIndex].synonyms = changedArray;
								return deref;
							})}
							insertAtIndex={j+1}
							valueToInsert={{
								comment: '',
								disabledInInterfaces: [],
								enabled: true,
								synonym: ''
							}}
						/>
						<MoveDownButton
							array={state.languages[languageIndex].synonyms}
							setArrayFunction={(changedArray :Array<SynonymLanguagesSynonymObject<'Array'>>) => setState(prev => {
								const deref :SynonymGUIState = JSON.parse(JSON.stringify(prev));
								deref.languages[languageIndex].synonyms = changedArray;
								return deref;
							})}
							index={j}
						/>
						<MoveUpButton
							array={state.languages[languageIndex].synonyms}
							setArrayFunction={(changedArray :Array<SynonymLanguagesSynonymObject<'Array'>>) => setState(prev => {
								const deref :SynonymGUIState = JSON.parse(JSON.stringify(prev));
								deref.languages[languageIndex].synonyms = changedArray;
								return deref;
							})}
							index={j}
						/>
						</Button.Group>
						*/}
					<DeleteItemButton
						array={state.languages[languageIndex].synonyms}
						disabled={!state.enabled || !state.languages[languageIndex].enabled || !state.languages[languageIndex].synonyms[j].enabled/* || j < 2*/}
						setArrayFunction={(changedArray :Array<SynonymGUI_LanguagesSynonymObject>) => setState(prev => {
							const deref :SynonymGUI = JSON.parse(JSON.stringify(prev));
							deref.languages[languageIndex].synonyms = changedArray;
							return deref;
						})}
						index={j}
					/>
				</Table.Cell>
			</Table.Row>)}
		</Table.Body>
	</Table>;
}
