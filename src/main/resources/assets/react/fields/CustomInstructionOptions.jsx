import getIn from 'get-value';
import {Form} from 'semantic-ui-react';

import {getEnonicContext} from 'semantic-ui-react-form/Context';
import {Checkbox} from 'semantic-ui-react-form/inputs/Checkbox';


export function CustomInstructionOptions(/*props*/) {
	//console.debug('CustomInstructionOptions props', props);

	const [context/*, dispatch*/] = getEnonicContext();
	//console.debug('CustomInstructionOptions context', context);

	const instruction = getIn(context.values, 'instruction');
	//console.debug('CustomInstructionOptions instruction', instruction);

	if (instruction !== 'custom') { return null; }

	return <>
		<Form.Field>
			<Checkbox
				label='Decide by type'
				path='decideByType'
				toggle
			/>
		</Form.Field>
		<Form.Field>
			<Checkbox
				label='Enabled'
				path='enabled'
				toggle
			/>
		</Form.Field>
		<Form.Field>
			<Checkbox
				label='Ngram'
				path='nGram' // node._indexConfig.default.nGram uses uppercase G in nGram
				toggle
			/>
		</Form.Field>
		<Form.Field>
			<Checkbox
				label='Fulltext'
				path='fulltext'
				toggle
			/>
		</Form.Field>
		<Form.Field>
			<Checkbox
				label='Include in _allText'
				path='includeInAllText'
				toggle
			/>
		</Form.Field>
		<Form.Field>
			<Checkbox
				label='Path'
				path='path'
				toggle
			/>
		</Form.Field>
	</>;
} // function CustomInstructionOptions
