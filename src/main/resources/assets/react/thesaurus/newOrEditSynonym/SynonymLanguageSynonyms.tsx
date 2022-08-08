import type {
	SynonymGUI,
	SynonymGUI_LanguagesSynonymObject
} from '/lib/explorer/types/Synonym.d';
import type {Locales} from '../../index.d';


import {InsertButton} from '../../components/InsertButton';
import {SynonymLanguageSynonymsTable} from './SynonymLanguageSynonymsTable';


export function SynonymLanguageSynonyms({
	interfaceOptions,
	languageIndex,
	locales,
	setState,
	state
} :{
	interfaceOptions :Array<unknown> // TODO
	languageIndex :number
	locales: Locales
	setState :React.Dispatch<React.SetStateAction<SynonymGUI>>
	state :SynonymGUI
}) {
	return <>
		{state.languages[languageIndex].synonyms.length
			? <SynonymLanguageSynonymsTable
				interfaceOptions={interfaceOptions}
				languageIndex={languageIndex}
				locales={locales}
				setState={setState}
				state={state}
			/>
			: null
		}
		<InsertButton
			array={state.languages[languageIndex].synonyms}
			disabled={!state.enabled || !state.languages[languageIndex].enabled}
			setArrayFunction={(changedArray :Array<SynonymGUI_LanguagesSynonymObject>) => setState(prev => {
				const deref :SynonymGUI = JSON.parse(JSON.stringify(prev));
				deref.languages[languageIndex].synonyms = changedArray;
				return deref;
			})}
			insertAtIndex={state.languages[languageIndex].synonyms.length}
			valueToInsert={{
				comment: '',
				disabledInInterfaces: [],
				enabled: true,
				synonym: '',
				use: 'from'
			}}
		/>
	</>;
}
