import type {
	CollectorComponents,
	ContentTypeOptions,
	Fields,
	SiteOptions
} from '../index.d';


import getIn from 'get-value';
import * as React from 'react';
import {Header, Segment} from 'semantic-ui-react';

//@ts-ignore
import {getEnonicContext} from 'semantic-ui-react-form/Context';


export function CollectorOptions(props :{
	collectorComponents :CollectorComponents
	contentTypeOptions :ContentTypeOptions
	siteOptions :SiteOptions
	fields :Fields
}) {
	//console.debug('CollectorOptions props', props);
	const {
		collectorComponents,
		contentTypeOptions,
		fields,
		siteOptions
	} = props;

	const [context, dispatch] = getEnonicContext();
	//console.debug('CollectorOptions context', context);
	const collectorName = getIn(context.values, 'collector.name');

	const isFirstRun = React.useRef(true);

	if (!collectorName) { return null; }

	if (!collectorComponents[collectorName]) { return <p>Collector {collectorName} NOT found!</p>; }

	return <Segment color='pink'>
		<Header as='h2' dividing content={collectorName} id='collector'/>
		{collectorComponents[collectorName]({
			context,
			dispatch,
			explorer: {
				contentTypeOptions,
				fields,
				siteOptions
			},
			isFirstRun,
			path: 'collector.config'
		})}
	</Segment>;
} // function CollectorOptions
