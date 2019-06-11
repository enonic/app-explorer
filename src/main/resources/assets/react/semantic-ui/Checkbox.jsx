import classNames from 'classnames';

import {Checkbox as FormikCheckbox} from '../formik/Checkbox'
//import {toStr} from '../utils/toStr';


export const Checkbox = ({
	className,
	checked,
	label,
	name,
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	children = <>
		<FormikCheckbox
			checked={checked}
			path={path}
		/>
		{label ? <label>{label}</label> : null}
	</>,
	...rest
}) => {
	/*console.debug(toStr({
		component: 'Semantic-ui/Checkbox',
		parentPath, name, path,
		checked,
		className,
		label,
		rest
	}));*/
	return <div className={classNames(className, 'ui checkbox')} {...rest}>{children}</div>;
}
