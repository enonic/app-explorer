import type {SynonymGUIState} from '/lib/explorer/types/Synonym.d';


import {
	Form,
	Table
} from 'semantic-ui-react';


export function SynonymLanguageOptions({
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
	return <Table celled compact striped>
		<Table.Header>
			<Table.Row>
				<Table.HeaderCell>Enabled</Table.HeaderCell>
				<Table.HeaderCell>Disabled in interfaces</Table.HeaderCell>
				<Table.HeaderCell>Comment</Table.HeaderCell>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			<Table.Row>
				<Table.Cell collapsing>
					<Form.Checkbox
						checked={state.languages[lang].enabled}
						disabled={!state.enabled}
						onChange={(_e, {checked}) => setState(prev => {
							const deref = JSON.parse(JSON.stringify(prev));
							deref.languages[lang].enabled = checked;
							return deref;
						})}
						toggle
					/>
				</Table.Cell>
				<Table.Cell>
					<Form.Dropdown
						clearable
						disabled={!state.enabled || !state.languages[lang].enabled}
						fluid
						multiple
						onChange={(_e,{value}) => setState(prev => {
							const deref :SynonymGUIState = JSON.parse(JSON.stringify(prev));
							deref.languages[lang].disabledInInterfaces = value as Array<string>;
							return deref;
						})}
						options={interfaceOptions}
						search
						selection
						value={state.languages[lang].disabledInInterfaces}
					/>
				</Table.Cell>
				<Table.Cell>
					<Form.Input
						disabled={!state.enabled || !state.languages[lang].enabled}
						fluid
						onChange={(_e, {value}) => setState(prev => {
							const deref = JSON.parse(JSON.stringify(prev));
							deref.languages[lang].comment = value;
							return deref;
						})}
						value={state.languages[lang].comment}
					/>
				</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table>;
}
