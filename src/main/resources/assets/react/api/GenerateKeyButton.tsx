import {
	Button,
	Icon
} from 'semantic-ui-react';
import {
	getEnonicContext,
	setValue
} from '@enonic/semantic-ui-react-form';


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
	const {dispatch} = getEnonicContext();
	return <Button
		icon
		onClick={() => {
			const key = makeKey();
			//console.debug('key', key);
			dispatch(setValue({path: 'key', value: key}));
		}}
	><Icon color='blue' name='key'/></Button>;
};
