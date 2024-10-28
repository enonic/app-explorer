import {
	Button,
	Icon
} from 'semantic-ui-react';
import {makeKey} from './makeKey';


export function GenerateKeyButton({
	setKey
} :{
	setKey :(key :string) => void
}) {
	return <Button
		icon
		onClick={() => setKey(makeKey())}
	><Icon color='blue' name='key'/></Button>;
}
