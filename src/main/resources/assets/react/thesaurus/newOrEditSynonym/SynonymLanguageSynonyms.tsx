import type {
	SynonymGUIState,
	SynonymLanguagesSynonymObject
} from '/lib/explorer/types/Synonym.d';


import {InsertButton} from '../../components/InsertButton';
import {SynonymLanguageSynonymsTable} from './SynonymLanguageSynonymsTable';


export function SynonymLanguageSynonyms({
	interfaceOptions,
	lang,
	setState,
	state
} :{
	interfaceOptions :Array<unknown> // TODO
	lang :string
	setState :React.Dispatch<React.SetStateAction<SynonymGUIState>>
	state :SynonymGUIState
}) {
	return state.languages[lang].synonyms.length
		? <>
			<SynonymLanguageSynonymsTable
				interfaceOptions={interfaceOptions}
				lang={lang}
				setState={setState}
				state={state}
			/>
			<InsertButton
				array={state.languages[lang].synonyms}
				disabled={!state.enabled || !state.languages[lang].enabled}
				setArrayFunction={(changedArray :Array<SynonymLanguagesSynonymObject<'Array'>>) => setState(prev => {
					const deref :SynonymGUIState = JSON.parse(JSON.stringify(prev));
					deref.languages[lang].synonyms = changedArray;
					return deref;
				})}
				insertAtIndex={state.languages[lang].synonyms.length}
				valueToInsert={{
					comment: '',
					disabledInInterfaces: [],
					enabled: true,
					synonym: '',
					use: 'from'
				}}
			/>
		</>
		: null;
}
