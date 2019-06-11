import {connect, getIn} from 'formik';

import {Checkbox} from '../semantic-ui/Checkbox';
import {Field} from '../semantic-ui/Field';
import {Fields} from '../semantic-ui/Fields';

import {toStr} from '../utils/toStr';


export const SearchStringFilter = connect(({
	formik: {
		values
	},
	parentPath,
	name = 'searchString',
	path = parentPath ? `${parentPath}.${name}` : name,
	value = values && getIn(values, path) || {}
}) => {
	console.debug(toStr({
		component: 'SearchStringFilter',
		//parentPath,
		//name,
		path,
		value
	}))
	const {
		allowLetters,// = true,
		allowUnicodeLetters,// = true
		allowDigits,// = true,
		allowUnderscore,// = true,
		allowSingleQuotes,// = true,
		allowAnd,// = true,
		allowOr,// = false,
		allowNegate,// = true,
		allowPrefix,// = false,
		allowPrecedence,// = false,
		allowPhrase,// = true
		allowTilde//= false
	} = value;
	return <>
		<Fields grouped>
			<Field>
				<Checkbox
					checked={allowLetters}
					parentPath={path}
					name='allowLetters'
					label='Allow letters a-zA-Z'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowUnicodeLetters}
					parentPath={path}
					name='allowUnicodeLetters'
					label='Allow unicode letters'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowDigits}
					parentPath={path}
					name='allowDigits'
					label='Allow digits 0-9'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowUnderscore}
					parentPath={path}
					name='allowUnderscore'
					label='Allow underscore _'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowSingleQuotes}
					parentPath={path}
					name='allowSingleQuotes'
					label="Allow single quotes '''"
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowAnd}
					parentPath={path}
					name='allowAnd'
					label='Allow and +'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowOr}
					parentPath={path}
					name='allowOr'
					label='Allow or |'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowNegate}
					parentPath={path}
					name='allowNegate'
					label='Allow negate -'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowPrefix}
					parentPath={path}
					name='allowPrefix'
					label='Allow prefix *'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowPrecedence}
					parentPath={path}
					name='allowPrecedence'
					label='Allow precendence ()'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowPhrase}
					parentPath={path}
					name='allowPhrase'
					label='Allow phrase ""'
				/>
			</Field>
			<Field>
				<Checkbox
					checked={allowTilde}
					parentPath={path}
					name='allowTilde'
					label='Allow tilde ~ (implies digits)'
				/>
			</Field>
		</Fields>
	</>;
}); // SearchStringFilter
