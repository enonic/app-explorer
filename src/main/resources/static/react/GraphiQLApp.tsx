import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';


export function GraphiQLApp({
	url
}: {
	url: string
}) {
	const fetcher = createGraphiQLFetcher({
		url
	});

	return <GraphiQL fetcher={fetcher}/>
}
