import {Button, Icon} from 'semantic-ui-react';

import {getEnonicContext} from './Context';
import {reset} from './Form';


export function ResetButton(props) {
	//console.debug('ResetButton props', props);

	const [context, dispatch] = getEnonicContext();
	//console.debug('ResetButton context', context);

	// disabled={}
	return <Button
		color='olive'
		onClick={() => dispatch(reset())}
		type='reset'
	><Icon name='history'/>Reset</Button>;
} // ResetButton
