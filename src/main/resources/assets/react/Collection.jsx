import {
	//Formik,
	getIn,
	ErrorMessage as FormikErrorMessage,
	Field as FormikField,
	withFormik
} from 'formik';
//import Nope from 'nope-validator';
import {createRef, useEffect, useState} from 'react'
import Scrollspy from 'react-scrollspy'
import {
	Form, Header, Icon,
	Input as SemanticUiReactInput,
	Menu, Message, Rail, Ref, Segment, Sticky
} from 'semantic-ui-react';
import traverse from 'traverse';
import * as Yup from 'yup';
import {
	Checkbox,
	Dropdown,
	Input
} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';

import {SubmitButton} from './semantic-ui/SubmitButton';
import {Cron} from './fields/Cron';
//import {toStr} from './utils/toStr';



const FormikSemanticUiReactInput = (props) => {
	//console.debug('FormikSemanticUiReactInput props', props);
	const {
		label,
		name,
		parentPath,
		path = parentPath ? `${parentPath}.${name}` : name,
		...inputRest
	} = props;
	return <FormikField
		name={path}
		render={(props) => {
			//console.debug('FormikField.render props', props);
			const {
				field,
				form
			} = props;
			const {
				//name,
				//onBlur,
				//onChange,
				type = 'text',
				//value,
				...fieldRest
			} = field;
			const {
				errors
			} = form;
			const error = getIn(errors, path);
			//console.debug('FormikField.render error', error);
			return <>
				<SemanticUiReactInput
					{...inputRest}
					{...fieldRest}
					error={!!error}
					label={label}
					type={type}
				/>
				<FormikErrorMessage
					name={path}
					render={(string) => {
						return <Message icon negative>
							<Icon name='warning'/>
							<Message.Content>
								<Message.Header>{path}</Message.Header>
								{string}
							</Message.Content>
						</Message>
					}}
				/>
			</>;
		}}
	/>; // FormikField
} // FormikSemanticUiReactInput


function convert(node) {
	traverse(node).forEach(function(value) { // Fat arrow destroys this
		const key = this.key;
		//log.info(toStr({key}));
		if([
			'crawl',
			'cron',
			'download',
			'fields',
			'headers',
			'queryParams',
			'scrape',
			'scrapeExpression',
			'scrapeJson',
			'tags',
			'urls',
			'urlExpression'
			//'value' // Nope this will destroy headers[index].value
		].includes(key)) {
			if (!value) {
				this.update([]);
			} else if (!Array.isArray(value)) {
				const array = [value];
				convert(array); // Recurse
				this.update(array);
			}
		}
	});
}


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
	React.useEffect(() => {
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
			<FormikSemanticUiReactInput
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
		{/*<Form.Field>
			<Checkbox
				formik={props}
				name='doCollect'
				label='Collect?'
			/>
		</Form.Field>
		<Cron/>*/}
	</Form>
} // MainForm


const MAIN_SCHEMA = Yup.object().shape({
	name: Yup.string()
		.max(255, 'Too Long!')
		.required('Required')
});


const MainFormik = withFormik({
	mapPropsToValues: (props) => props.values,
	validationSchema: MAIN_SCHEMA
})(MainForm);


export const Collection = ({
	action,
	collectorsObj,
	collectorOptions,
	contentTypeOptions,
	fields = {},
	siteOptions,
	initialValues = {
		name: ''
	}
} = {}) => {
	//console.debug('collectorsObj', collectorsObj);
	//console.debug('collectorOptions', collectorOptions);
	/*console.debug(toStr({
		initialValues
	}));*/
	convert(initialValues);
	/*console.debug(toStr({
		initialValues
	}));*/

	const [formValues, setFormValues] = React.useState(initialValues);
	console.debug('formValues', formValues);

	return <>
		<Segment color='black'>
			<MainFormik
				explorer={{
					collectorOptions
				}}
				onChange={({
					isValid,
					values
				}) => {
					setFormValues({
						...formValues,
						...values
					});
				}}
				values={formValues}
			/>
		</Segment>
		{formValues.collector && formValues.collector.name
			? collectorsObj[formValues.collector.name]
				? <Segment color='pink'>
					<Header as='h2' dividing content={formValues.collector.name} id='collector'/>
					{collectorsObj[formValues.collector.name]({
						explorer: {
							contentTypeOptions,
							fields,
							siteOptions
						},
						onChange: ({
							isValid,
							values
						}) => {
							setFormValues({
								...formValues,
								collector: {
									name: formValues.collector.name,
									config: values
								}
							});
						},
						values: formValues.collector.config
					})}
				</Segment>
				: <p>Collector NOT found!</p>
			: <p>Collector NOT selected!</p>
		}
		<form action={action} method='POST'>
			<input name='json' type='hidden' value={JSON.stringify(formValues)}/>
			<button type='submit'>Save collection</button>
		</form>
	</>;
} // Collection

/*
const validate = (values, props) => {
	console.debug('validate', values, props);
	return {
		name: 'Jalla'
	};
}


const validateName = (values) => (value) => {
	//console.debug('validateName', {values, value});
	try {
		COLLECTION_SCHEMA.validateSyncAt('name', values); // throws on validationError
		return;
	} catch (e) {
		return e.message;
	}
}




const contextRef = createRef();
validate={values => COLLECTION_SCHEMA.validate(values)}
validate={values => validate(values)}
validateOnBlur={true}
validateOnChange={true}
validationSchema={COLLECTION_SCHEMA} // NOTE: Not passed on in formik bag!
return <Ref innerRef={contextRef}>
	<Segment basic compact style={{padding: 0}}>
		<Formik
			initialValues={initialValues}
			onSubmit={(values, formikBag) => {
				console.debug('In Formik.onSubmit');
				//console.debug(values);
				//console.debug(formikBag);
				//setFormValues(values); // This works
				//document.getElementById('json').setAttribute('value', JSON.stringify(values));
				formikBag.setSubmitting(false);
			}}
			render={formik => {
				const {
					errors,
					handleReset,
					handleSubmit,
					setFieldValue,
					//submitForm, // Trigger a form submission. The promise will be rejected if form is invalid.
					validateForm,
					values
				} = formik;
				/*useEffect(() => { // Uncaught Invariant Violation: Invalid hook call. Hooks can only be called inside of the body of a function component.
					setFormValues(values);
				});
				setFormValues(values); // Does it work before render? Yes, but happens twice.
				//console.debug('Formik', {errors});
				/*console.debug(toStr({
					values
				}));
				return <Form
					action={action}
					autoComplete="off"
					method="POST"
					onReset={handleReset}
					onSubmit={(e) => {
						e.preventDefault(); // Don't submit
						console.debug('In Form.onSubmit');
						//setFormValues(values); // Doesn't work here!
						//document.getElementById('json').setAttribute('value', JSON.stringify(values));
						//const r =
						handleSubmit(values, formik);
						//console.debug(r); // undefined
						//return validateForm();
						//return handleSubmit();
					}}
					style={{
						width: '100%'
					}}
				>
					<Segment color='black'>
						<Form.Field>
							<Input
								id='name'
								fluid
								formik={formik}
								label={{ basic: true, content: 'Name' }}
								name='name'
								validate={validateName(values)}
							/>
						</Form.Field>
						<Form.Field>
							<Checkbox
								formik={formik}
								name='doCollect'
								label='Collect?'
							/>
						</Form.Field>
						<Cron/>
					</Segment>
					<Segment color='pink'>
						<Header as='h2' dividing content='Collector' id='collector'/>
						<Form.Field>
							<Dropdown
								defaultValue={getIn(values, 'collector.name', '')}
								formik={formik}
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
						<div>
							{values.collector
								&& values.collector.name
								&& collectorsObj[values.collector.name]
								? collectorsObj[values.collector.name]({contentTypeOptions, fields, formik, siteOptions})
								: null}
						</div>
					</Segment>
					<Form.Field>
						<SubmitButton className='primary' text="Save collection" id='save'/>
					</Form.Field>
					<input id="json" name="json" type="hidden"/>
				</Form>;
			}}
		/>
		<Rail position='right'>
			<Sticky context={contextRef} offset={14}>
				<Scrollspy
					items={[
						'top',
						'name',
						'cron',
						'collector',
						'save',
					]}
					currentClassName='active'
					componentTag={({children}) => <Menu vertical>{children}</Menu>}
				>
					<Menu.Item href='#top'>Menu</Menu.Item>
					<Menu.Item href='#name'>Name</Menu.Item>
					<Menu.Item href='#cron'>Scheduling</Menu.Item>
					<Menu.Item href='#collector'>Collector</Menu.Item>
					<Menu.Item href='#save'>Save</Menu.Item>
				</Scrollspy>
			</Sticky>
		</Rail>
	</Segment>
</Ref>;
*/
