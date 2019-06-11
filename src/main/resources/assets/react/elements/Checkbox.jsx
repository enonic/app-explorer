import {Field} from 'formik';

import {Label} from '../elements/Label';


export const Checkbox = ({
	checked,
	label,
	tabIndex, // So it doesn't end up in ...rest
	type, // So it doesn't end up in ...rest
	value = checked,
	...rest
}) => {
	//console.log(JSON.stringify({checked, label, rest, type, value}, null, 4));
	return <div className='field'>
		<div className='ui checkbox'>
			<Field
				checked={checked}
				type="checkbox"
				value={value}
				{...rest}
			/>
			{label ? <Label label={label}/> : null}
		</div>
	</div>;
};
