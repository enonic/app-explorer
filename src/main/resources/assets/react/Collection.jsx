import Scrollspy from 'react-scrollspy'
import {Button, Header, Icon, Menu, /*Rail, Ref, */Segment/*, Sticky*/} from 'semantic-ui-react';

import {SubmitButton} from './semantic-ui/SubmitButton';
import {MainFormik} from './collection/MainFormik';
import {CronFormik} from './collection/CronFormik';


export const Collection = ({
	action,
	collectorsObj,
	collectorOptions,
	contentTypeOptions,
	fields = {},
	siteOptions,
	TOOL_PATH,
	initialValues = {
		name: ''
	}
} = {}) => {
	//console.debug('collectorsObj', collectorsObj);
	//console.debug('collectorOptions', collectorOptions);
	//console.debug('initialValues',initialValues);

	//const mainFormikRef = React.useRef(null);
	//const mainFormikRef = React.createRef();

	const [state, setState] = React.useState({ // Importing useState leads to React version mismatch
		//dirty: {},
		isValid: {},
		values:	initialValues
	});
	//console.debug('state', state);
	const rV = <>
		<Segment color='black'>
			<MainFormik
				explorer={{
					collectorOptions
				}}
				onChange={({
					//dirty,
					isValid,
					values
				}) => {
					setState({
						/*dirty: {
							...state.dirty,
							main: dirty
						},*/
						isValid: {
							...state.isValid,
							main: isValid
						},
						values: {
							...state.values,
							...values
						}
					});
				}}
				values={state.values}
			/>
		</Segment>
		{state.values.collector && state.values.collector.name
			? collectorsObj[state.values.collector.name]
				? <Segment color='pink'>
					<Header as='h2' dividing content={state.values.collector.name} id='collector'/>
					{collectorsObj[state.values.collector.name]({
						explorer: {
							contentTypeOptions,
							fields,
							siteOptions
						},
						onChange: ({
							//dirty,
							isValid,
							values
						}) => {
							setState({
								/*dirty: {
									...state.dirty,
									collector: dirty
								},*/
								isValid: {
									...state.isValid,
									collector: isValid
								},
								values: {
									...state.values,
									collector: {
										name: state.values.collector.name,
										config: values
									}
								}
							});
						},
						values: state.values.collector.config
					})}
				</Segment>
				: <p>Collector NOT found!</p>
			: <p>Collector NOT selected!</p>
		}
		<Segment color='green'>
			<Header as='h2' dividing content='Scheduling' id='cron'/>
			<CronFormik
				onChange={({
					//dirty,
					isValid,
					values
				}) => {
					//console.debug('CronFormik onChange values', values);
					//console.debug('CronFormik onChange state', state);
					setState({
						/*dirty: {
							...state.dirty,
							cron: dirty
						},*/
						isValid: state.isValid,
						values: {
							...state.values,
							doCollect: values.doCollect,
							cron: values.cron
						}
					});
				}}
				values={{
					doCollect: state.values.doCollect,
					cron: state.values.cron
				}}
			/>
		</Segment>
		<form action={action} method='POST'>
			<input name='json' type='hidden' value={JSON.stringify(state.values)}/>
			<Button
				disabled={Object.keys(state.isValid).some(k => !state.isValid[k])}
				primary
				type='submit'
			><Icon className='save outline'/>Save collection</Button>
			{/*<Button
				disabled={!Object.keys(state.dirty).some(k => state.dirty[k])}
				secondary
				type="reset"
			>Reset</Button>*/}
			<Button
				as='a'
				href={`${TOOL_PATH}/collections/list`}
				secondary
				type="Button"
			>Cancel</Button>
		</form>
	</>;
	//console.debug('mainFormikRef', mainFormikRef);
	//console.debug('mainFormikRef.current', mainFormikRef.current);
	return rV;
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
