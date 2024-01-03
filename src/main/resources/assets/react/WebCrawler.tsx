import type {
	CollectorComponentRef,
	CollectorProps
} from '@enonic-types/lib-explorer';
import type { CollectorConfig } from '/tasks/webcrawl/webcrawl.d';

import * as React from 'react';
import { Form } from 'semantic-ui-react';

import { DEFAULT_UA } from '../../tasks/webcrawl/constants';
import { Excludes } from './webcrawler/Excludes';
import { HttpRequestHeaders } from './webcrawler/HttpRequestHeaders';
import { useWebCrawlerState } from './webcrawler/useWebCrawlerState';


export const CollectorForm = React.forwardRef(({
	collectorConfig,
	//explorer,
	setCollectorConfig,
	setCollectorConfigErrorCount
}: CollectorProps<CollectorConfig>, ref: CollectorComponentRef<CollectorConfig>) => {
	const {
		baseUri,
		baseUriError,
		baseUriOnBlur,
		baseUriOnChange,
		excludesArray,
		httpRequestHeaders, setHttpRequestHeaders,
		keepHtml,
		maxPages, setMaxPages,
		setExcludesArray,
		setKeepHtml,
		setUserAgent,
		userAgent
	} = useWebCrawlerState({
		collectorConfig,
		ref,
		setCollectorConfig,
		setCollectorConfigErrorCount
	});
	return <Form>
		<Form.Input
			error={baseUriError}
			fluid
			label='URL'
			onBlur={baseUriOnBlur}
			onChange={baseUriOnChange}
			required
			value={baseUri}
		/>
		<Excludes
			excludesArray={excludesArray}
			setExcludesArray={setExcludesArray}
		/>
		<Form.Input
			label='Max pages'
			max={100000}
			min={1}
			onChange={(_event,{value}) => setMaxPages(parseInt(value))}
			placeholder='1000'
			type='number'
			value={maxPages}
		/>
		<Form.Checkbox
			checked={keepHtml}
			label='Keep a copy of the HTML source? (not recommended)'
			onChange={(_event, {checked}) => setKeepHtml(checked)}
		/>
		<Form.Input
			fluid
			label='Custom User-Agent'
			onChange={(_event,{value}) => setUserAgent(value)}
			placeholder={`Leave empty to use ${DEFAULT_UA}`}
			value={userAgent}
		/>
		<HttpRequestHeaders
			httpRequestHeaders={httpRequestHeaders}
			setHttpRequestHeaders={setHttpRequestHeaders}
		/>
	</Form>;
}); // Collector
CollectorForm.displayName = 'Collector';
