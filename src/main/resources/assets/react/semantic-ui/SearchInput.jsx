import classNames from 'classnames';

import {TextInput} from '../formik/TextInput';

import {Icon} from '../semantic-ui/Icon';

//import {toStr} from '../utils/toStr';



export const SearchInput = ({
	// Semantic-ui
	disabled,
	error,
	fluid,
	left,
	loading,

	// HTML input attributes
	placeholder = 'Search ...',

	// React
	//children,

	// Formik
	parentPath,
	name = 'search',
	path = parentPath ? `${parentPath}.${name}` : name,

	// ...rest has to be the last parameter
	...rest // onChange
}) => {
	/*console.debug(toStr({
		component: 'SearchInput',
		semanticUi: {
			disabled,
			error,
			fluid,
			left,
			loading
		},
		html: {
			placeholder
		},
		formik: {
			parentPath,
			name,
			path
		}
	}));*/
	return <div
		className={classNames({
			disabled,
			error,
			fluid,
			left,
			loading
		}, 'ui icon input')}
	>
		<TextInput path={path} placeholder={placeholder} {...rest}/>
		<Icon className='search'/>
	</div>;
} // SearchInput
