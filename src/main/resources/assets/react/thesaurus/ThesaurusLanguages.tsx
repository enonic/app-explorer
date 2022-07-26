import type {
	Locales
} from '../index.d';

import {Header, Segment} from 'semantic-ui-react';
import {LanguageDropdown} from '../collection/LanguageDropdown';


export function ThesaurusLanguages({
	languages,
	loading,
	locales,
	setLanguages
} :{
	languages :Array<string>
	loading :boolean
	locales :Locales
	setLanguages :(languages :Array<string>) => void
}) {
	return <Segment>
		<Header
			as='h3'
			content='Languages'
			disabled={loading}
		/>
		<LanguageDropdown
			disabled={loading}
			includeANoneOption={false}
			language={languages}
			loading={loading}
			locales={locales}
			multiple={true}
			onChange={(_event,{value: newLanguages}) => setLanguages(newLanguages as Array<string>)}
			setLanguage={setLanguages}
		/>
	</Segment>
}
