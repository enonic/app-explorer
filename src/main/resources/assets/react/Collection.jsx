import {Formik, getIn} from 'formik';
import {createRef} from 'react'
import Scrollspy from 'react-scrollspy'
import {Form, Header, Menu, Rail, Ref, Segment, Sticky} from 'semantic-ui-react';
import traverse from 'traverse';
import {
	Checkbox,
	Dropdown,
	Input
} from '@enonic/semantic-ui-react-formik-functional/dist/index.cjs';

import {SubmitButton} from './semantic-ui/SubmitButton';
import {Cron} from './fields/Cron';
//import {toStr} from './utils/toStr';


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


export const Collection = ({
	action,
	collectorsObj,
	collectorOptions,
	fields = {},
	initialValues = {
		name: ''
	}
} = {}) => {
	/*console.debug(toStr({
		initialValues
	}));*/
	convert(initialValues);
	/*console.debug(toStr({
		initialValues
	}));*/
	const contextRef = createRef();
	return <Ref innerRef={contextRef}>
		<Segment basic compact style={{padding: 0}}>
			<Formik
				initialValues={initialValues}
				render={formik => {
					const {
						handleSubmit,
						setFieldValue,
						values
					} = formik;
					/*console.debug(toStr({
						values
					}));*/
					return <Form
						action={action}
						autoComplete="off"
						method="POST"
						onSubmit={() => {
							document.getElementById('json').setAttribute('value', JSON.stringify(values))
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
									? collectorsObj[values.collector.name]({fields, formik})
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
} // Collection
