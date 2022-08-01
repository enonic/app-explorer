import type {SynonymGUI} from '/lib/explorer/types/Synonym.d';


import {Form} from 'semantic-ui-react';


export function SynonymOptions({
	interfaceOptions,
	setState,
	state
} :{
	interfaceOptions :Array<unknown> // TODO
	setState :React.Dispatch<React.SetStateAction<SynonymGUI>>
	state :SynonymGUI
}) {
	return <Form>
		<Form.Checkbox
			checked={state.enabled}
			label='Enabled'
			onChange={(_e, {checked}) => setState(prev => ({
				...prev,
				enabled: checked
			}))}
			toggle
		/>
		<Form.Dropdown
			clearable
			disabled={!state.enabled}
			fluid
			label='Disabled in interfaces'
			multiple
			onChange={(_e,{value}) => setState(prev => ({
				...prev,
				disabledInInterfaces: value as Array<string>
			}))}
			options={interfaceOptions}
			search
			selection
			value={state.disabledInInterfaces}
		/>
		<Form.Input
			disabled={!state.enabled}
			fluid
			label='Comment'
			onChange={(_e, {value}) => setState(prev => ({
				...prev,
				comment: value
			}))}
			value={state.comment}
		/>
	</Form>;
}
