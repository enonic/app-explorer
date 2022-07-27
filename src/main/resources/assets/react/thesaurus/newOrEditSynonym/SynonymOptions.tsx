import type {SynonymGUIState} from '/lib/explorer/types/Synonym.d';


import {
	Form,
	Table
} from 'semantic-ui-react';


export function SynonymOptions({
	interfaceOptions,
	setState,
	state
} :{
	interfaceOptions :Array<unknown> // TODO
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
						checked={state.enabled}
						onChange={(_e, {checked}) => setState(prev => ({
							...prev,
							enabled: checked
						}))}
						toggle
					/>
				</Table.Cell>
				<Table.Cell>
					<Form.Dropdown
						clearable
						disabled={!state.enabled}
						fluid
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
				</Table.Cell>
				<Table.Cell>
					<Form.Input
						disabled={!state.enabled}
						fluid
						onChange={(_e, {value}) => setState(prev => ({
							...prev,
							comment: value
						}))}
						value={state.comment}
					/>
				</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table>;
}
