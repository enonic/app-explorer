import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL as GraphiQLOrig } from 'graphiql';
import * as React from 'react';


function GraphiQL({
	headers = {},
	url,
}: {
	headers?: Record<string,string>
	url: string
}) {

	// GraphiQL fails if this is converted to state
	const fetcher = createGraphiQLFetcher({
		headers,
		url
	});

	return <GraphiQLOrig fetcher={fetcher}/>
}

export default GraphiQL;
