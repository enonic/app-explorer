import {Formik, getIn, withFormik} from 'formik';
import {Form, Header} from 'semantic-ui-react';
//import {Dropdown} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';
import * as Yup from 'yup';

import {Input} from '../formik/semanticUi/Input';
import {Dropdown} from '../formik/semanticUi/Dropdown';


/*const FormikWithRefSupport = React.forwardRef(({children, ...rest}, ref) => {
	const formikRef = React.useRef();
	React.useImperativeHandle(ref, () => ({
		resetForm: () => resetForm()
	}));
	return <Formik ref={formikRef} {...rest}>{children}</Formik>
});*/


const MainForm = (props) => {
	const {
		// Passed as props:
		explorer: {
			collectorOptions
		},
		onChange,
		values,

		// FormikBag added by withFormik
		dirty,
		errors,
		isValid,
		setFieldTouched,
		setFieldValue,
		touched,
		validateField,
		validateForm
	} = props;
	//console.debug('MainForm props', props);
	/*console.debug('MainForm', {
		dirty,
		errors,
		isValid,
		touched,
		values
	});*/

	// Call onChange every time values changes
	React.useEffect(() => { // Importing useEffect leads to React version mismatch
		if (onChange) {
			onChange({
				dirty,
				isValid,
				values
			});
		}
	}, [dirty, isValid, values]);

	return <Form
		autoComplete='off'
		style={{
			width: '100%'
		}}
	>
		<Header as='h1' dividing content='Collection' id='collection'/>
		<Form.Field>
			<Input
				id='name'
				fluid
				label={{ basic: true, content: 'Name' }}
				name='name'
				onBlur={(ignoredEvent) => {
					//console.debug('Input onBlur');
					setFieldTouched('name');
					//validateField('name'); // validate is not a function
					validateForm(); // This works with validationSchema
				}}
				onChange={(event, {value}) => {
					setFieldValue('name', value);
					setFieldTouched('name');
				}}
			/>
		</Form.Field>
		<Header as='h2' dividing content='Collector'/>
		<Form.Field>
			<Dropdown
				fluid
				path='collector.name'
				onBlur={(ignoredEvent) => {
					//console.debug('Dropdown onBlur');
					setFieldTouched('collector.name');
				}}
				onChange={(event, {value: collectorAppName}) => {
					//console.debug('Dropdown onChange', {event, collectorAppName});
					setFieldValue('collector', {
						name: collectorAppName,
						config: {}
					});
					setFieldTouched('collector.name');
				}}
				options={collectorOptions}
				placeholder='Please select a collector'
				selection
			/>
		</Form.Field>
	</Form>
} // MainForm


const MAIN_SCHEMA = Yup.object().shape({
	name: Yup.string()
		.max(255, 'Too Long!')
		.required('Required'),
	collector: Yup.object().shape({
		name: Yup.string().min(1,'Too short').required('Required')/*,
		config: Yup.object().shape({})*/
	})
}); // MAIN_SCHEMA


export const MainFormik = withFormik({
	mapPropsToValues: (props) => props.values,
	validateOnBlur: false,
	validationSchema: MAIN_SCHEMA
})(MainForm);
