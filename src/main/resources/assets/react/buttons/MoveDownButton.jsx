import {connect, getIn} from 'formik';
import {Button} from '../semantic-ui/Button';
import {Icon} from '../semantic-ui/Icon';


const mySwap = (array, indexA, indexB) => {
	const copy = [...(array || [])];
	const a = copy[indexA];
	copy[indexA] = copy[indexB];
	copy[indexB] = a;
	return copy;
};


export const MoveDownButton = connect(({
	formik: {
		setFieldValue,
		values
	},
	index,
	path,
	swap,
	text = '', // ↓
	currentValue = values && path && getIn(values, path),
	visible = true,
	...rest
}) => {
	if(!visible) { return null; }
	const nextIndex = index + 1;
	return <Button
		className={text ? '' : 'icon'}
		onClick={() => (path && currentValue)
			? setFieldValue(path, mySwap(currentValue, index, nextIndex))
			: swap(index, nextIndex)}
		{...rest}
	><Icon className='blue arrow down'/>{text}</Button>;
});
