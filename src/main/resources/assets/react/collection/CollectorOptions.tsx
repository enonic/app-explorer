import type {AnyObject} from '@enonic-types/lib-explorer';
import type {
	ContentTypeOptions,
	Fields,
	SiteOptions
} from '@enonic-types/lib-explorer/Collector.d';
import type {CollectorComponents} from '../index.d';


import * as React from 'react';
import {Header} from 'semantic-ui-react';


export function CollectorOptions({
	collectorComponentRef,
	collectorComponents,
	collectorConfig,
	collectorName,
	contentTypeOptions,
	fields,
	initialCollectorConfig,
	// loading,
	setCollectorConfig,
	setCollectorConfigErrorCount,
	siteOptions
}: {
	collectorComponentRef: React.MutableRefObject<{
		afterReset: () => void
		validate: (collectorConfig: AnyObject) => boolean
			}>
	collectorComponents: CollectorComponents
	collectorConfig: AnyObject
	collectorName: string
	contentTypeOptions: ContentTypeOptions
	initialCollectorConfig: AnyObject
	loading: boolean
	setCollectorConfig: (collectorConfig: AnyObject) => void
	setCollectorConfigErrorCount: (count: number) => void
	siteOptions: SiteOptions
	fields: Fields
}) {
	if (!collectorName || collectorName === '_none') { return null; }
	if (!collectorComponents[collectorName]) {
		return <p>Collector {collectorName} NOT found!</p>;
	}

	const Collector = collectorComponents[collectorName];

	return <>
		<Header as='h3' dividing content='Configuration' id='collector'/>
		<Collector
			collectorConfig={collectorConfig}
			initialCollectorConfig={initialCollectorConfig}
			setCollectorConfig={setCollectorConfig}
			setCollectorConfigErrorCount={setCollectorConfigErrorCount}
			explorer={{
				contentTypeOptions,
				fields,
				siteOptions
			}}
			ref={collectorComponentRef}
		/>
	</>;
} // function CollectorOptions
