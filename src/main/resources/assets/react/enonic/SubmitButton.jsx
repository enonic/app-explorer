import {Button, Icon} from 'semantic-ui-react';

import {getEnonicContext} from './Context';
import {submit} from './Form';


export function SubmitButton(props) {
	//console.debug('SubmitButton props', props);

	const [context, dispatch] = getEnonicContext();
	//console.debug('SubmitButton context', context);

	// disabled={}
	return <Button
		color='green'
		onClick={() => dispatch(submit())}
		type='submit'
	><Icon name='save'/>Submit</Button>;
} // SubmitButton
