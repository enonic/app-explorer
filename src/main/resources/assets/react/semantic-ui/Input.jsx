import classNames from 'classnames';
import {connect, Field, getIn} from 'formik';

import {Icon} from './Icon';


export const Input = ({
	disabled, error,
	left, icon, loading,
	formik: {
		values
	},
	autoComplete = 'off',
	name,
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	type = 'text',
	value = getIn(values, path) || '',
	size = Math.max(25, (value && value.length || 1)),
	children = loading ? <Icon className='search'/>: null,
	...rest // placeholder
}) => <div
	className={classNames({
		disabled, error,
		left, icon, loading
	}, 'ui input')}
><Field
		autoComplete={autoComplete}
		disabled={disabled}
		name={path}
		size={size}
		type={type}
		value={value}
		{...rest}
	/>
	{children}
</div>;
