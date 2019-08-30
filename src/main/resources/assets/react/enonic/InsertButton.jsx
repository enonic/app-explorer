import {Button, Icon} from 'semantic-ui-react';

import {getEnonicContext} from './Context';
import {insert} from './Form';


export function InsertButton(props) {
	//console.debug('InsertButton props', props);
	const {
		index = 0,
		path,
		value
	} = props;

	const [context, dispatch] = getEnonicContext();
	//console.debug('InsertButton context', context);

	// disabled={}
	return <Button
		icon
		onClick={() => dispatch(insert({
			index,
			path,
			value
		}))}
		type='button'
	><Icon color='green' name='plus'/></Button>;
} // InsertButton
