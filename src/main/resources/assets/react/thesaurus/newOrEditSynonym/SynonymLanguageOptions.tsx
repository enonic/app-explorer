import type {SynonymGUI} from '@enonic-types/lib-explorer/Synonym.d';


import {Form} from 'semantic-ui-react';


export function SynonymLanguageOptions({
	interfaceOptions,
	languageIndex,
	setState,
	state
} :{
	languageIndex :number
	interfaceOptions :Array<unknown> // TODO
	setState :React.Dispatch<React.SetStateAction<SynonymGUI>>
	state :SynonymGUI
}) {
	return <Form>
		<Form.Checkbox
			checked={state.languages[languageIndex].enabled}
			disabled={!state.enabled}
			label='Enabled'
			onChange={(_e, {checked}) => setState(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				deref.languages[languageIndex].enabled = checked;
				return deref;
			})}
			toggle
		/>
		<Form.Dropdown
			clearable
			disabled={!state.enabled || !state.languages[languageIndex].enabled}
			fluid
			label='Disabled in interfaces'
			multiple
			onChange={(_e,{value}) => setState(prev => {
				const deref :SynonymGUI = JSON.parse(JSON.stringify(prev));
				deref.languages[languageIndex].disabledInInterfaces = value as Array<string>;
				return deref;
			})}
			options={interfaceOptions}
			search
			selection
			value={state.languages[languageIndex].disabledInInterfaces}
		/>
		<Form.Input
			disabled={!state.enabled || !state.languages[languageIndex].enabled}
			fluid
			label='Comment'
			onChange={(_e, {value}) => setState(prev => {
				const deref = JSON.parse(JSON.stringify(prev));
				deref.languages[languageIndex].comment = value;
				return deref;
			})}
			value={state.languages[languageIndex].comment}
		/>
	</Form>;
}
