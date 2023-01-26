import { sanitize } from '@enonic/js-utils';
import { useExplorerPlugin } from '@graphiql/plugin-explorer';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL as GraphiQLOrig } from 'graphiql';
import * as React from 'react';


function graphqlSanitize(str: string) {
	// sanitize allows a string to start with a digit, the GraphQL spec doesn't
	// in addition we don't want the string to start with an underscore
	return sanitize(str).replace(/^[0-9_]+/, '')
}


function GraphiQL({
	headers = {},
	searchString = '',
	url,
}: {
	headers?: Record<string,string>
	searchString?: string
	url: string
}) {

	// GraphiQL fails if this is converted to state
	const fetcher = createGraphiQLFetcher({
		headers,
		url
	});

	const [query, setQuery] = React.useState(`query ${graphqlSanitize(searchString) || 'MyQuery'} {
	querySynonyms(searchString: "${searchString}") {
		search(
		count: 1
		highlight: {fields: [
			{field: "title"}
			{field: "text"}
			{field: "_allText"}
		]}
		aggregations: [
			{name: "collections", terms: {field: "_collection"}},
			{name: "documentTypes", terms: {field: "_documentType"}}
		]
		) {
		count
		total
		aggregationsAsJson
		hits {
			_highlight
			_collection
			_documentType
			_json
			_score
		}
		}
		languages
		synonyms {
		thesaurusName
		synonyms {
			locale
			synonym
		}
		}
	}
}`);

	const explorerPlugin = useExplorerPlugin({
		query,
		onEdit: setQuery,
	});

	return <GraphiQLOrig
		fetcher={fetcher}
		onEditQuery={setQuery}
		plugins={[explorerPlugin]}
		query={query}
	/>
}

export default GraphiQL;
