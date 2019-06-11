import {connect, getIn} from 'formik';

import {SetButton} from '../buttons/SetButton';

import {NumberInput} from '../elements/NumberInput';

import {Checkbox} from '../semantic-ui/Checkbox';
import {Field} from '../semantic-ui/Field';
import {Fields} from '../semantic-ui/Fields';
import {Header} from '../semantic-ui/Header';
import {Icon} from '../semantic-ui/Icon';

//import {toStr} from '../utils/toStr';


export const Pagination = connect(({
	formik: {
		values
	},
	id,
	legend = null,
	name = 'pagination',
	parentPath,
	path = parentPath ? `${parentPath}.${name}` : name,
	value = values && getIn(values, path) || false
}) => {
	if (!value) {
		return <Field id={id}>
			<SetButton
				field={path}
				value={{
					pagesToShow: 10,
					first: true,
					prev: true,
					next: true,
					last: true
				}}
			><Icon className='green plus'/>Add pagination</SetButton>
		</Field>;
	}
	const {first, prev, next, last} = value;
	return <>
		<Header dividing id={id}>{legend}</Header>
		<Fields grouped>
			<Field>
				<NumberInput label="Pages to show" path={`${path}.pagesToShow`} value={value.pagesToShow || 10}/>
			</Field>
			<Field>
				<Checkbox
					checked={first}
					label="Provide first"
					name={`${path}.first`}
				/>
			</Field>
			<Field>
				<Checkbox
					checked={prev}
					label="Provide previous"
					name={`${path}.prev`}
				/>
			</Field>
			<Field>
				<Checkbox
					checked={next}
					label="Provide next"
					name={`${path}.next`}
				/>
			</Field>
			<Field>
				<Checkbox
					checked={last}
					label="Provide last"
					name={`${path}.last`}
				/>
			</Field>
			<Field>
				<SetButton
					field={path}
					value={false}
				><Icon className='red minus'/> Remove pagination</SetButton>
			</Field>
		</Fields>
	</>;
}); // pagination
