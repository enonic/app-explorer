import Scrollspy from 'react-scrollspy'
import {Button, Header, Icon, Menu, /*Rail, Ref, */Segment/*, Sticky*/} from 'semantic-ui-react';

import {SubmitButton} from './semantic-ui/SubmitButton';
import {MainFormik} from './collection/MainFormik';
import {CronFormik} from './collection/CronFormik';


export const Collection = ({
	collectorsObj,
	collectorOptions,
	contentTypeOptions,
	fields = {},
	onClose,
	mode,
	servicesBaseUrl,
	siteOptions,
	initialValues = {
		name: '',
		collector: {
			name: '',
			config: {}
		},
		cron: [{
			month: '*',
			dayOfMonth: '*',
			dayOfWeek: '*',
			minute: '*',
			hour: '*'
		}],
		doCollect: false
	}
} = {}) => {
	/*console.debug('Collection', {
		collectorsObj,
		collectorOptions,
		contentTypeOptions,
		fields,
		siteOptions,
		initialValues
	});*/

	//const mainFormikRef = React.useRef(null);
	//const mainFormikRef = React.createRef();

	const [state, setState] = React.useState({ // Importing useState leads to React version mismatch
		//dirty: {},
		isValid: {
			collector: false
		},
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
					//console.debug('MainFormik onChange', {state, isValid, values});
					setState(prevState => ({
						...prevState, // Unless this is here, initial isValid wont be set
						/*dirty: {
							...prevState.dirty,
							main: dirty
						},*/
						isValid: {
							...prevState.isValid,
							main: isValid
						},
						values: {
							...prevState.values,
							...values
						}
					}));
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
							//console.debug('Collector onChange', {state, isValid, values});
							setState(prevState => ({
								...prevState, // Unless this is here, initial isValid wont be set
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
							}));
						},
						values: state.values.collector.config
					})}
				</Segment>
				: <p>Collector NOT found!</p>
			: null
		}
		<Segment color='green'>
			<Header as='h2' dividing content='Scheduling' id='cron'/>
			<CronFormik
				onChange={({
					//dirty,
					isValid,
					values
				}) => {
					//console.debug('CronFormik onChange', {state, isValid, values});
					setState(prevState => ({
						...prevState, // Unless this is here, initial isValid wont be set
						/*dirty: {
							...state.dirty,
							cron: dirty
						},*/
						isValid: {
							...prevState.isValid,
							cron: isValid
						},
						values: {
							...prevState.values,
							doCollect: values.doCollect,
							cron: values.cron
						}
					}));
				}}
				values={{
					doCollect: state.values.doCollect,
					cron: state.values.cron
				}}
			/>
		</Segment>
		<Button
			disabled={Object.keys(state.isValid).some(k => !state.isValid[k])}
			primary
			onClick={() => {
				fetch(`${servicesBaseUrl}/collection${mode === 'create' ? 'Create' : 'Modify'}?json=${JSON.stringify(state.values)}`, {
					method: 'POST'
				}).then(response => {
					onClose()
				})
			}}
		><Icon className='save outline'/>{mode === 'create' ? 'Create' : 'Modify'} collection</Button>
		{/*<Button
			disabled={!Object.keys(state.dirty).some(k => state.dirty[k])}
			secondary
			type="reset"
		>Reset</Button>*/}
		<Button
			onClick={onClose}
			secondary
			type="button"
		>Cancel</Button>
	</>;
	//console.debug('state', state);
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
