import {Button} from './Button';
import {Icon} from '../semantic-ui/Icon';


export const SubmitButton = ({children, text, ...rest}) =>
	<Button type='submit' {...rest}><Icon className='save outline'/>{children||text}</Button>;
