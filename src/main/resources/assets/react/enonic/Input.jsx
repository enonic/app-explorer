import {getEnonicContext} from './Context';


export function Input(props = {}) {
	//console.debug('Input props', props);

	const [context, dispatch] = getEnonicContext();
	console.debug('Input context', context);
	return <></>;
} // Input
