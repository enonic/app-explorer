import type {StrictModalProps} from 'semantic-ui-react';
import type JsonModalState from './JsonModalState.d';


import React from 'react';
import {Modal} from 'semantic-ui-react';
import {TypedReactJson} from '../../interfaces/search/TypedReactJson';


function JsonModal({
	size = 'large',
	state,
	setState
}: {
	size?: StrictModalProps['size']
	state: JsonModalState
	setState: React.Dispatch<React.SetStateAction<JsonModalState>>
}) {
	return <Modal
		open={state.open}
		onClose={() => setState({
			open: false,
			header: '',
			parsedJson: undefined,
		})}
		size={size}
	>
		<Modal.Header content={state.header}/>
		<Modal.Content>
			{state.parsedJson
				? <TypedReactJson
					enableClipboard={false}
					displayArrayKey={false}
					displayDataTypes={false}
					displayObjectSize={false}
					indentWidth={2}
					name={null}
					quotesOnKeys={false}
					sortKeys={true}
					src={state.parsedJson}
				/>
				: null}
		</Modal.Content>
	</Modal>;
}

export default JsonModal;
