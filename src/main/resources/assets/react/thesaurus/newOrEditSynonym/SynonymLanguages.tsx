import type {SynonymGUIState} from '/lib/explorer/types/Synonym.d';


import {
	Accordion,
	Segment
} from 'semantic-ui-react';
import {SynonymLanguageOptions} from './SynonymLanguageOptions';
import {SynonymLanguageSynonyms} from './SynonymLanguageSynonyms';


export function SynonymLanguages({
	interfaceOptions,
	setState,
	state,
	thesaurusLanguages
} :{
	interfaceOptions :Array<unknown> // TODO
	setState :React.Dispatch<React.SetStateAction<SynonymGUIState>>
	state :SynonymGUIState
	thesaurusLanguages :Array<string>
}) {

	return thesaurusLanguages.length
		? <Accordion.Accordion
			defaultActiveIndex={thesaurusLanguages.map((_, i) => i)}
			exclusive={false}
			fluid
			panels={thesaurusLanguages.map((lang, i) => ({
				key: i,
				title: lang,
				content: {
					content: (state.languages[lang]
						? <>
							<Accordion.Accordion
								fluid
								panels={[{
									key: 0,
									title: 'Language Options',
									content: {
										content:(
											<Segment
												basic
												disabled={!state.enabled}
												vertical
											>
												<SynonymLanguageOptions
													interfaceOptions={interfaceOptions}
													lang={lang}
													setState={setState}
													state={state}
												/>
											</Segment>
										)
									}
								}]}
							/>
							<Segment
								basic
								disabled={!state.enabled || !state.languages[lang].enabled}
								vertical
							>
								<SynonymLanguageSynonyms
									interfaceOptions={interfaceOptions}
									lang={lang}
									setState={setState}
									state={state}
								/>
							</Segment>
						</>
						: null)
				}
			}))
			}
		/>
		: <Segment basic>Edit the thesaurus options to add languages...</Segment>;
}
