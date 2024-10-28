import type JsonModalState from './JsonModalState.d';


import * as React from 'react';


export default function useJsonModalState () {
	const [state, setState] = React.useState<JsonModalState>({
		open: false,
		header: '',
		parsedJson: undefined,
	});
	return {
		state, setState
	};
}
