import {Field} from 'formik';
import classNames from 'classnames';
//import {toStr} from '../utils/toStr';


export const Radio = ({
	className,
	checked,
	children, // So it doesn't end up in ...rest
	label,
	name,
	type, // So it doesn't end up in ...rest
	...rest
}) => {
	//console.debug(toStr({component: 'Radio', className, label, rest}));
	return <div className={classNames(className, 'ui radio checkbox')}>
		<Field
			checked={checked}
			name={name}
			type='radio'
			{...rest}
		/>
		<label>{label}</label>
 	</div>;
}
