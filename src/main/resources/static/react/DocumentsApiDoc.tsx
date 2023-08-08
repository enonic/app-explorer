import type { QueryNodeParams } from '@enonic-types/lib-node';


// import React from 'react';
import Action from './documentsApi/Action';
import { DOCUMENT_REST_API_VERSION } from '../../webapp/constants';


const PATH_PREFIX = '';//`/api/v${DOCUMENT_REST_API_VERSION}/documents`;


export default function DocumentsApiDoc() {
	return <main>
		<h1>Documents API documentation</h1>
		<h2>Bulk</h2>
		<Action
			comment='Get document(s)'
			curl={`-H "authorization:Explorer-Api-Key XXXX"`}
			curlUrlParams='?id=1&id=2'
			headers={{
				accept: {
					value: 'application/json',
					attributes: '<optional>',
					description: 'The response format.'
				},
				authorization: {
					value: 'Explorer-Api-Key XXXX',
					attributes: '<required>',
					description: 'The API key (password) for the collection you want to get documents from.'
				},
				'content-type': {
					value: 'application/json',
					attributes: '<optional>',
					description: "Get requests can't have a body (content) in the Fetch API standard"
				},
			}}
			method="GET"
			pattern={`${PATH_PREFIX}/{collection}`}
			parameters={{
				collection: {
					attributes: '<required>',
					description: 'The collection to get documents from. Typically provided via the url path.'
				},
				count: {
					attributes: '<optional>',
					default: '10',
					description: 'How many documents to get. Limited to between 1 and 100.'
				},
				start: {
					attributes: '<optional>',
					default: '0',
					description: 'Start index (used for paging).'
				},
				filters: {
					attributes: '<optional>',
					default: '{}',
					description: 'Query filters. See <a href="https://developer.enonic.com/docs/xp/stable/storage/filters">documentation</a>.'
				},
				query: {
					attributes: '<optional>',
					default: '{}',
					description: 'Query expression. Keep in mind that filters are usually more quicker. See <a href="https://developer.enonic.com/docs/xp/stable/storage/noql">documentation</a>.'
				}
			}}
		/>
		<Action
			comment='Create or modify document(s)'
			curl={`-H "authorization:Explorer-Api-Key XXXX" -H "content-type:application/json" -d'${JSON.stringify([{
				available: true,
				count: -999999999999999,
				date: '2021-01-01',
				datetime: '2021-01-01T00:00:00',
				instant: '2021-01-01T00:00:00Z',
				location: '59.9090442,10.7423389',
				price: -999999999999999.9,
				time: '00:00:00',
				language: 'english',
				text: 'This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.',
				title: 'Example Domain',
				url: 'https://www.example.com'
			},{
				_id: '1',
				available: false,
				count: 999999999999999,
				date: '2021-12-31',
				datetime: '2021-12-31T23:59:59',
				instant: '2021-12-31T23:59:59Z',
				location: [
					59.9090442,
					10.7423389
				],
				price: 999999999999999.9,
				time: '23:59:59',
				language: 'english',
				text: 'Whatever',
				title: 'Whatever',
				url: 'https://www.whatever.com'
			}], null, 4)}'`}
			curlUrlParams='?documentType=webpage&requireValid=false'
			method="POST"
			pattern={`${PATH_PREFIX}/{collection}`}
		/>
		<Action
			comment='Query document(s)'
			curl={`-H "authorization:Explorer-Api-Key XXXX" -H "content-type:application/json" -d'${JSON.stringify({
				count: 10,
				filters: {
					boolean: {
						must: {
							exists: {
								field: 'url'
							}
						}
					}
				},
				query: {
					boolean: {
						must: {
							term: {
								field: 'url',
								value: 'https://enonic.com'
							}
						}
					}
				},
				sort: {
					field: 'score',
					direction: 'DESC'
				},
				start: 0,
			} as QueryNodeParams, null, 4)}'`}
			method="POST"
			pattern={`${PATH_PREFIX}/{collection}/query`}
		/>
		<Action
			comment='Delete document(s)'
			curl={`-H "authorization:Explorer-Api-Key XXXX"`}
			curlUrlParams='?id=1&id=2'
			method="DELETE"
			pattern={`${PATH_PREFIX}/{collection}`}
		/>
		<h2>Single</h2>
		<Action
			curl={`-H "authorization:Explorer-Api-Key XXXX"`}
			comment='Get a document'
			method="GET"
			pattern={`${PATH_PREFIX}/{collection}/{documentId}`}
		/>
		<Action
			curl={`-H "authorization:Explorer-Api-Key XXXX" -H "content-type:application/json" -d'${JSON.stringify({
				available: false,
				count: 0,
				date: '2023-01-01',
				datetime: '2023-01-01T00:00:00',
				instant: '2023-01-01T00:00:00Z',
				location: '59.9090442,10.7423389',
				price: 0,
				// time: '00:00:00',
				language: 'norsk',
				text: 'Hei!',
				title: 'Tittel',
				url: 'https://www.example.no'
			}, null, 4)}'`}
			curlUrlParams='?documentType=webpage&requireValid=false'
			comment='Patch a document'
			method="POST"
			pattern={`${PATH_PREFIX}/{collection}/{documentId}`}
		/>
		<Action
			curl={`-H "authorization:Explorer-Api-Key XXXX"`}
			comment='Delete a document'
			method="DELETE"
			pattern={`${PATH_PREFIX}/{collection}/{documentId}`}
		/>
	</main>;
}
