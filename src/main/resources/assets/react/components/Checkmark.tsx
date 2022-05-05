import {Icon} from 'semantic-ui-react';


export const Checkmark = ({
	checked = false,

	// remove from rest
	/* eslint-disable no-unused-vars */
	color = null,
	name = null,
	/* eslint-enable no-unused-vars */

	...rest // disabled, size
}) => checked
	? <Icon color='green' name='checkmark' {...rest}/>
	: null;//<Icon color='red' name='x' {...rest}/>;
