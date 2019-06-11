import {Field} from 'formik';
import {Label} from './Label';


export const LabeledField = ({children, label, ...rest}) =>
	<Label label={label}><Field {...rest}/></Label>;
