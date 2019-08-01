import {getIn, withFormik} from 'formik';
import {Form, Header} from 'semantic-ui-react';
import {Dropdown} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';
import * as Yup from 'yup';

import {Input} from '../formik/semanticUi/Input';


const MainForm = (props) => {
	const {
		// Passed as props:
		explorer: {
			collectorOptions
		},
		onChange,
		values,

		// FormikBag added by withFormik
		isValid,
		setFieldValue
	} = props;
	//console.debug('MainForm props', props);
	//console.debug('MainForm values', values);

	// Call onChange every time values changes
	React.useEffect(() => { // Importing useEffect leads to React version mismatch
		if (onChange) {
			onChange({
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
		<Header as='h1' dividing content='Collection' id='collection'/>
		<Form.Field>
			<Input
				id='name'
				fluid
				label={{ basic: true, content: 'Name' }}
				name='name'
			/>
		</Form.Field>
		<Header as='h2' dividing content='Collector'/>
		<Form.Field>
			<Dropdown
				defaultValue={getIn(values, 'collector.name', '')}
				formik={props}
				path='collector.name'
				onChange={(event, {value: collectorAppName}) => {
					//console.debug({event, collectorAppName});
					setFieldValue('collector', {
						name: collectorAppName,
						config: {}
					});
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
		.required('Required')
});


export const MainFormik = withFormik({
	mapPropsToValues: (props) => props.values,
	validationSchema: MAIN_SCHEMA
})(MainForm);
