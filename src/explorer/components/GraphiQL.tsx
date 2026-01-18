import { sanitize } from '@enonic/js-utils';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL as GraphiQLOrig } from 'graphiql';
import * as React from 'react';


function graphqlSanitize(str: string) {
	// sanitize allows a string to start with a digit, the GraphQL spec doesn't
	// in addition we don't want the string to start with an underscore
	return sanitize(str).replace(/^[0-9_]+/, '')
}

// Create the explorer plugin once, outside the component
const explorer = explorerPlugin({
	showAttribution: false
});


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

	const defaultQuery = `query ${graphqlSanitize(searchString) || 'MyQuery'} {
	interface {
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
					# _json
					_score
				}
			} # search
			languages
			synonyms {
				thesaurusName
				synonyms {
					locale
					synonym
				}
			} # synonyms
		}
	}
}`;

	return <GraphiQLOrig
		defaultQuery={defaultQuery}
		fetcher={fetcher}
		plugins={[explorer]}
	/>
}

export default GraphiQL;
