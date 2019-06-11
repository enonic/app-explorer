import classNames from 'classnames';
import {connect, getIn} from 'formik';
import {Button} from '../../Button';
import {Icon} from '../../Icon';


const isFunction = (obj) => typeof obj === 'function';


const myRemove = (array, index) => {
	const copy = array ? [...array] : [];
	if (isFunction(copy.splice)) {
    	copy.splice(index, 1);
	}
	return copy;
}


export const RemoveButton = connect(({
	// Html5
	type, // So it doesn't end up in ...rest

	// React
	text = '',
	children = <><Icon red trash alternate outline/>{text}</>,
	visible = true,

	// Formik
	formik: {
		setFieldValue,
		values
	},
	path,
	value = getIn(values, path),
	index,
	onClick = () => setFieldValue(path, myRemove(value, index)),

	// Semantic UI
	basic, circular, compact, fluid, labeled,
	icon = !!text,
	toggle,
	positive, negative,
	left, right, floated, bottom, top, attached,
	mini, tiny, small, medium, large, big, huge, massive,
	red, orange, yellow, olive, green, teal, blue, violet, purple, pink, brown,
	grey, black,

	...rest
}) => {
	if(!visible) { return null; }
	//console.log(JSON.stringify({index, rest}, null, 4));
	return <Button
		className={classNames({
			basic, circular, compact, fluid, labeled, icon, toggle,
			positive, negative,
			left, right, floated, bottom, top, attached,
			mini, tiny, small, medium, large, big, huge, massive,
			red, orange, yellow, olive, green, teal, blue, violet, purple,
			pink, brown, grey, black
		})}
		onClick={onClick}
		type='button'
		{...rest}
	>{children}</Button>
});
