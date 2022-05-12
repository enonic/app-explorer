import {
	Button,
	Icon
} from 'semantic-ui-react';

//@ts-ignore
import {setValue} from 'semantic-ui-react-form';
//@ts-ignore
import {getEnonicContext} from 'semantic-ui-react-form/Context';


function makeKey({
	characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
	length = 32
} = {}) {
	let result = '';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}


export const GenerateKeyButton = () => {
	const [
		//@ts-ignore
		context, //eslint-disable-line @typescript-eslint/no-unused-vars
		dispatch
	] = getEnonicContext(); // eslint-disable-line no-unused-vars
	return <Button
		icon
		onClick={() => {
			const key = makeKey();
			//console.debug('key', key);
			dispatch(setValue({path: 'key', value: key}));
		}}
	><Icon color='blue' name='key'/></Button>;
};
