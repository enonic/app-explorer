import {withFormik} from 'formik';
import {Form} from 'semantic-ui-react';
import {Checkbox} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';

import {Cron} from '../fields/Cron';


const CronForm = (props) => {
	//console.debug('CronForm props', props);
	const {
		// Passed as props:
		onChange,
		values,

		// FormikBag added by withFormik
		dirty,
		isValid
	} = props;

	// Call onChange every time values changes
	React.useEffect(() => { // Importing useEffect leads to React version mismatch
		if (onChange) {
			onChange({
				dirty,
				isValid,
				values
			});
		}
	}, [values]);

	return <Form
		autoComplete='off'
		style={{
			width: '100%'
		}}
	>
		<Form.Field>
			<Checkbox
				formik={props}
				name='doCollect'
				label='Collect?'
			/>
		</Form.Field>
		<Cron/>
	</Form>
} // CronForm


export const CronFormik = withFormik({
	mapPropsToValues: (props) => props.values
})(CronForm);
