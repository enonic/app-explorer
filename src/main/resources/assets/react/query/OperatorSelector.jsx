import {connect, getIn} from 'formik';

import {Field} from '../semantic-ui/Field';
import {Fields} from '../semantic-ui/Fields';
import {Radio} from '../semantic-ui/Radio';

//import {toStr} from '../utils/toStr';


export const OperatorSelector = connect(({
	formik: {
		setFieldValue,
		values
	},
	defaultValue = 'or',
	parentPath,
	name = parentPath ? `${parentPath}.operator` : 'operator',
	value = values ? getIn(values, name, defaultValue) : defaultValue
}) => {
	/*console.debug(toStr({
		defaultValue, legend, parentPath, name, values, value
	}));*/
	return <Fields grouped>
		<Field>
			<Radio
				checked={value !== 'and'}
				label="OR"
				name={name}
				onChange={() => {
					//console.debug(toStr({name, or: 'or'}));
					setFieldValue(name, 'or')
				}}
			/>
		</Field>
		<Field>
			<Radio
				checked={value === 'and'}
				label="AND"
				name={name}
				onChange={() => {
					//console.debug(toStr({name, and: 'and'}));
					setFieldValue(name, 'and')
				}}
			/>
		</Field>
	</Fields>;
});
