import classNames from 'classnames';
import {connect, Field, getIn} from 'formik';
import {Label} from './Label';

//import {toStr} from '../utils/toStr';


export const Input = connect(({
	formik: {
		values
	},
	autoComplete = 'off',
	className,
	label,
	name,
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	type = 'text',
	value = getIn(values, path) || '',
	size = Math.max(25, (value && value.length || 1)),
	...rest
}) => {
	//console.debug(toStr({component: 'Input', autoComplete, label, parentPath, name, path, type, size, value, rest}));
	return <div className={classNames('field', className)}>
		{label ? <Label label={label}/> : null}
		<Field
			autoComplete={autoComplete}
			name={path}
			size={size}
			type={type}
			value={value}
			{...rest}
		/>
	</div>;
});
