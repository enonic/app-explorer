import type {CollectionFormValues} from '/lib/explorer/types/index.d';
import type {
	ContentTypeOptions,
	Fields,
	SiteOptions
} from '/lib/explorer/types/Collector.d';
import type {CollectorComponents} from '../index.d';


import {getIn} from '@enonic/js-utils';
import * as React from 'react';
import {Header, Segment} from 'semantic-ui-react';
import {getEnonicContext} from '@enonic/semantic-ui-react-form';


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

	const {dispatch, state} = getEnonicContext<CollectionFormValues>();
	//console.debug('CollectorOptions context', context);
	const collectorName :string = getIn(state.values, 'collector.name');

	const isFirstRun = React.useRef(true);

	if (!collectorName) { return null; }

	if (!collectorComponents[collectorName]) { return <p>Collector {collectorName} NOT found!</p>; }

	return <Segment color='pink'>
		<Header as='h2' dividing content={collectorName} id='collector'/>
		{collectorComponents[collectorName]({
			context: state,
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
