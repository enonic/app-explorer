import type {SynonymGUI} from '@enonic-types/lib-explorer/Synonym.d';
import type {Locales} from '../../index.d';


import {
	Accordion,
	Segment
} from 'semantic-ui-react';
import {SynonymLanguageOptions} from './SynonymLanguageOptions';
import {SynonymLanguageSynonyms} from './SynonymLanguageSynonyms';


export function SynonymLanguages({
	// Required
	interfaceOptions,
	locales,
	setState,
	state,
	// Optional
	_id
} :{
	// Required
	interfaceOptions :Array<unknown> // TODO
	locales :Locales
	setState :React.Dispatch<React.SetStateAction<SynonymGUI>>
	state :SynonymGUI
	// Optional
	_id ?:string
}) {
	return state.languages.length
		? <Accordion.Accordion
			defaultActiveIndex={state.languages.map((_, i) => i)}
			exclusive={false}
			panels={state.languages.map(({locale}, i) => ({
				key: i,
				title: locale,
				content: {
					content: (state.languages[i]
						? <>
							{_id
								? <Accordion.Accordion
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
														languageIndex={i}
														setState={setState}
														state={state}
													/>
												</Segment>
											)
										}
									}]}
								/>
								: null
							}
							<Segment
								basic
								disabled={!state.enabled || !state.languages[i].enabled}
								vertical
							>
								<SynonymLanguageSynonyms
									interfaceOptions={interfaceOptions}
									languageIndex={i}
									locales={locales}
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
