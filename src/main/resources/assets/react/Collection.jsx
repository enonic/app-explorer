import Scrollspy from 'react-scrollspy'
import {Header, Menu, /*Rail, Ref, */Segment/*, Sticky*/} from 'semantic-ui-react';
import traverse from 'traverse';

import {SubmitButton} from './semantic-ui/SubmitButton';
//import {toStr} from './utils/toStr';
import {MainFormik} from './collection/MainFormik';
import {CronFormik} from './collection/CronFormik';


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
} // convert


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

	// Importing useState leads to React version mismatch
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
		<Segment color='green'>
			<Header as='h2' dividing content='Scheduling' id='cron'/>
			<CronFormik
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
