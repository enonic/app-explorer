import {Field} from 'formik';

import {Label} from '../elements/Label';

//import {toStr} from '../utils/toStr';

export const Radio = ({checked, label, type, value = checked, ...rest}) => {
	//console.log(toStr({checked, label, rest, type, value}));
	const radio = <Field checked={checked} type="radio" value={value} {...rest}/>;
	if(!label) { return radio; }
	return <Label label={label}>{radio}</Label>
};
