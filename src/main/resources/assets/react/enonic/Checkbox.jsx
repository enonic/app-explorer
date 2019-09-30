import getIn from 'get-value';
import {Checkbox as SemanticUiReactCheckbox} from 'semantic-ui-react';

import {getEnonicContext} from './Context';
import {setValue} from './Form';


export function Checkbox(props) {
	const [context, dispatch] = getEnonicContext();

	const {
		path,
		value = getIn(context.values, path),
		...rest //defaultChecked
	} = props;

	return <SemanticUiReactCheckbox
		{...rest}
		checked={value}
		name={path}
		onChange={(ignored,{checked}) => {
			//console.debug('Checkbox onChange checked', checked);
			dispatch(setValue({path, value: checked}));
		}}
	/>;
} // function Checkbox
