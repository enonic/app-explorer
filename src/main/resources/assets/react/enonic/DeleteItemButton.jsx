import {Button, Icon} from 'semantic-ui-react';

import {getEnonicContext} from './Context';
import {deleteItem} from './Form';


export function DeleteItemButton(props) {
	//console.debug('DeleteItemButton props', props);
	const {
		disabled = false,
		index = 0,
		path
	} = props;

	const [context, dispatch] = getEnonicContext();
	//console.debug('DeleteItemButton context', context);

	return <Button
		disabled={disabled}
		icon
		onClick={() => dispatch(deleteItem({
			index,
			path
		}))}
		type='button'
	><Icon color='red' name='alternate outline trash'/></Button>;
} // DeleteItemButton
