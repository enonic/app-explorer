import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL as GraphiQLOrig } from 'graphiql';
import * as React from 'react';


function GraphiQL({
	url
}: {
	url: string
}) {
	const fetcher = createGraphiQLFetcher({url}); // GraphiQL fails if this is converted to state
	return <GraphiQLOrig fetcher={fetcher}/>
}

export default GraphiQL;
