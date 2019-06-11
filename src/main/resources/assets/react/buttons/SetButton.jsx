import {connect, getIn} from 'formik';
import {Button} from '../semantic-ui/Button';
//import {toStr} from '../utils/toStr';


export const SetButton = connect(({
	children,
	formik: {
		setFieldValue,
		values
	} = {},
	name = '',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	field = path, // Backwards compatibility (should be cleaned up)
	value,
	onClick = () => {
		//console.debug(toStr({field, value}));
		setFieldValue(field, value)
	},
	...rest
}) => {
	//console.debug(toStr({parentPath, name, path, field, value}));
	return <Button
		onClick={onClick}
		{...rest}
	>{children}</Button>;
});
