import {connect, getIn} from 'formik';
import {Button} from '../semantic-ui/Button';
import {Icon} from '../semantic-ui/Icon';


const isFunction = (obj) => typeof obj === 'function';


const myRemove = (array, index) => {
	const copy = array ? [...array] : [];
	if (isFunction(copy.splice)) {
    	copy.splice(index, 1);
	}
	return copy;
}


export const RemoveButton = connect(({
	formik: {
		setFieldValue,
		values
	},
	index,
	path,
	remove,
	text = '',
	currentValue = values && path && getIn(values, path),
	visible = true,
	...rest}) => {
	if(!visible) { return null; }
	//console.log(JSON.stringify({index, rest}, null, 4));
	return <Button
		className={text ? '' : 'icon'}
		onClick={() => (path && currentValue)
			? setFieldValue(path, myRemove(currentValue, index))
			: remove(index)
		} {...rest}
	><Icon className='red minus'/>{text}</Button>
});
