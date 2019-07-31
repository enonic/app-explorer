import {
	//Formik,
	getIn,
	ErrorMessage as FormikErrorMessage,
	Field as FormikField,
	withFormik
} from 'formik';
//import {createRef, useEffect, useState} from 'react'; // Can lead to version mismatch
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
	const [formsValid, setFormsValid] = React.useState({});
	//console.debug('formValues', formValues);
	//console.debug('formsValid', formsValid);

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
					setFormsValid({
						...formsValid,
						main: isValid
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
							setFormsValid({
								...formsValid,
								collector: isValid
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
const contextRef = React.createRef();
return <Ref innerRef={contextRef}>
	<Segment basic compact style={{padding: 0}}>
		<Formik/>
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
