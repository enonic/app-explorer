import type {
	AnyObject,
	CollectionFormValues
} from '/lib/explorer/types/index.d';
import type {
	ContentTypeOptions,
	Fields,
	SiteOptions
} from '/lib/explorer/types/Collector.d';
import type {CollectorComponents} from '../index.d';


import * as React from 'react';
import {Header, Segment} from 'semantic-ui-react';


export function CollectorOptions({
	collectorComponentRef,
	collectorComponents,
	collectorConfig,
	collectorName,
	contentTypeOptions,
	fields,
	setCollectorConfig,
	setCollectorConfigErrorCount,
	siteOptions
} :{
	collectorComponentRef :React.MutableRefObject<{
		reset :() => void
		validate :(collectorConfig :AnyObject) => boolean
			}>
	collectorComponents :CollectorComponents
	collectorConfig :AnyObject
	collectorName :string
	contentTypeOptions :ContentTypeOptions
	setCollectorConfig :(collectorConfig :AnyObject) => void
	setCollectorConfigErrorCount :(count :number) => void
	siteOptions :SiteOptions
	fields :Fields
}) {
	//const [isFirstRun, setIsFirstRun] = React.useState(true);
	const isFirstRun = React.useRef(true);

	if (!collectorName) { return null; }

	if (!collectorComponents[collectorName]) { return <p>Collector {collectorName} NOT found!</p>; }

	const Collector = collectorComponents[collectorName];

	return <Segment color='pink'>
		<Header as='h2' dividing content={collectorName} id='collector'/>
		<Collector
			collectorConfig={collectorConfig}
			setCollectorConfig={setCollectorConfig}
			setCollectorConfigErrorCount={setCollectorConfigErrorCount}
			explorer={{
				contentTypeOptions,
				fields,
				siteOptions
			}}
			isFirstRun={isFirstRun}
			path='collector.config'
			ref={collectorComponentRef}
		/>
	</Segment>;
} // function CollectorOptions
