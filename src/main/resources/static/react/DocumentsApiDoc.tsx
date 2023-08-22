import type { QueryNodeParams } from '@enonic-types/lib-node';


import { useState } from 'react';
import {
	// Container,
	Form,
	Segment
} from 'semantic-ui-react';
import Action from './documentsApi/Action';
// import { DOCUMENT_REST_API_VERSION } from '../../webapp/constants';


const PATH_PREFIX = '';//`/api/v${DOCUMENT_REST_API_VERSION}/documents`;


export default function DocumentsApiDoc() {

	const [apiKey, setApiKey] = useState<string>(window['__EXPLORER_API_KEY__']);
	const [collection, setCollection] = useState<string>();
	const [documentId, setDocumentId] = useState<string>();

	const prefix = `${PATH_PREFIX}/${collection ?? '{collection}'}`;
	const documentPath = `${prefix}/${documentId ?? '{documentId}'}`;

	return <Segment as='main' basic padded='very'>
		<h1>Documents API documentation</h1>

		<h2>Common</h2>

		<Form>
			<Form.Input
				defaultValue={apiKey}
				label='API key'
				placeholder='API key'
				onChange={(_, { value }) => setApiKey(value)}
			/>
			<Form.Input
				label='Collection'
				placeholder='Collection'
				onChange={(_, { value }) => setCollection(value)}
			/>
		</Form>

		<h2>Bulk</h2>

		<Action
			name='get-documents'
			apiKey={apiKey}
			comment='Get document(s)'
			curl={`-H "authorization:Explorer-Api-Key ${apiKey}"`}
			headers={{
				// accept: {
				// 	value: 'application/json',
				// 	attributes: '<optional>',
				// 	description: 'The response format.'
				// },
				authorization: {
					value: `Explorer-Api-Key ${apiKey}`,
					attributes: '<required>',
					description: 'The API key (password) for the collection you want to get document(s) from.'
				},
				// 'content-type': {
				// 	value: 'application/json',
				// 	attributes: '<optional>',
				// 	description: "Get requests can't have a body (content) in the Fetch API standard"
				// },
			}}
			method="GET"
			pattern={`${prefix}`}
			parameters={{
				// collection: {
				// 	attributes: '<required>',
				// 	description: 'The collection to get documents from. Typically provided via the url path.'
				// },
				// count: {
				// 	attributes: '<optional>',
				// 	default: '10',
				// 	description: 'How many documents to get. Limited to between 1 and 100.'
				// },
				id: {
					default: ['1', '2'],
					description: 'The id of the document to get. Can be provided multiple times.',
					list: true,
					required: true,
					type: 'string'
				},
				// start: {
				// 	attributes: '<optional>',
				// 	default: '0',
				// 	description: 'Start index (used for paging).'
				// },
				// filters: {
				// 	attributes: '<optional>',
				// 	default: '{}',
				// 	description: 'Query filters. See <a href="https://developer.enonic.com/docs/xp/stable/storage/filters">documentation</a>.'
				// },
				// query: {
				// 	attributes: '<optional>',
				// 	default: '{}',
				// 	description: 'Query expression. Keep in mind that filters are usually more quicker. See <a href="https://developer.enonic.com/docs/xp/stable/storage/noql">documentation</a>.'
				// }
			}}
			responses={[{
				body: [{
					id: '1',
					collection: "enonic",
					collector:{
						id: "com.enonic.app.explorer:webcrawl",
						version: "2.0.0.SNAPSHOT"
					},
					createdTime: "2023-07-24T11:27:10.679Z",
					document: {
						text: 'This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.',
						title: 'Example Domain',
						url: 'https://www.example.com'
					},
					documentType: "webpage",
					language: "en",
					modifiedTime: "2023-08-07T08:54:42.294Z",
					status: 200,
					stemmingLanguage: "en",
					valid: true,
				}],
				// contentType: 'text/json;charset=utf-8',
				status: 200,
			},{
				body: [{
					id: '1',
					error: "Didn't find any document with id '1'",
					status: 404
				}, {
					id: '2',
					error: "Didn't find any document with id '2'",
					status: 404
				}],
				// contentType: 'text/json;charset=utf-8',
				status: 200,
			}]}
		/>

		<Action
			name='crud-documents'
			apiKey={apiKey}
			comment='Create, get, modify or delete document(s)'
			curl={`-H "authorization:Explorer-Api-Key ${apiKey}" -H "content-type:application/json"`}
			data={{
				default: `[{
	// "action": "create", // Create is assumed if action and id is missing.
	"document": {
		"available": true,
		"count": -999999999999999,
		"date": "2021-01-01",
		"datetime": "2021-01-01T00:00:00",
		"instant": "2021-01-01T00:00:00Z",
		"location": "59.9090442,10.7423389",
		"price": -999999999999999.9,
		"time": "00:00:00",
		"language": "english",
		"text": "This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.",
		"title": "Example Domain",
		"url": "https://www.example.com"
	}
},{
	"action": "get",
	"id": "1"
},{
	// "action": "modify", // Modify is assumed if action is missing, but id is present.
	"id": "1",
	"document": {
		"available": false,
		"count": 999999999999999,
		"date": "2021-12-31",
		"datetime": "2021-12-31T23:59:59",
		"instant": "2021-12-31T23:59:59Z",
		"location": [
			59.9090442,
			10.7423389
		],
		"price": 999999999999999.9,
		"time": "23:59:59",
		"language": "english",
		"text": "Whatever",
		"title": "Whatever",
		"url": "https://www.whatever.com"
	}
},{
	"action": "delete",
	"id": "1"
}]`,
				examples: [{
					comment: 'Create a document',
					type: `{
	action: 'create'
	id: never
	document: Record<string, unknown>
	documentType?: string
}`,
					example: {
						// action: 'create',
						document: {
							text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
							title: 'Hello World',
							uri: 'https://www.example.com'
						}
					}
				}, {
					comment: 'Get a document',
					type: `{
	action: 'get'
	id: string
	document: never
	documentType: never
}`,
					example: {
						action: 'get',
						id: '1',
					}
				}, {
					comment: 'Modify a document',
					type: `{
	action: 'modify'
	id: string
	document: Record<string, unknown>
	documentType?: string
}`,
					example: {
						id: '1',
						document: {
							text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
							title: 'Hello World',
							uri: 'https://www.example.com'
						}
					}
				}, {
					comment: 'Delete a document',
					type: `{
	action: 'delete'
	id: string
	document: never
	documentType: never
}`,
					example: {
						action: 'delete',
						id: '1',
					}
				}, {
					comment: 'Create multiple documents',
					type: `{
	action: 'create'
	id: never
	document: Record<string, unknown>
	documentType?: string
}[]`,
					example: [{
						document: {
							text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
							title: 'The standard Lorem Ipsum passage, used since the 1500s',
							uri: 'https://www.example.com'
						}
					}, {
						document: {
							text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
							title: 'Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC',
							uri: 'https://www.example.com'
						}
					}]
				}, {
					comment: 'Get multiple documents',
					type: `{
	action: 'get'
	id: string
	document: never
	documentType: never
}[]`,
					example: [{
						action: 'get',
						id: '1'
					}, {
						action: 'get',
						id: '2'
					}]
				}, {
					comment: 'Modify multiple documents',
					type: `{
	action: 'modify'
	id: string
	document: Record<string, unknown>
	documentType?: string
}[]`,
					example: [{
						id: '1',
						document: {
							text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
							title: 'The standard Lorem Ipsum passage, used since the 1500s',
							uri: 'https://www.example.com'
						}
					}, {
						id: '2',
						document: {
							text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
							title: 'Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC',
							uri: 'https://www.example.com'
						}
					}]
				}, {
					comment: 'Delete multiple documents',
					type: `{
	action: 'delete'
	id: string
	document: never
	documentType: never
}[]`,
					example: [{
						action: 'delete',
						id: '1'
					}, {
						action: 'delete',
						id: '2'
					}]
				}, {
					comment: 'Create, get, modify or delete multiple documents',
					type: `{
	action: 'create' | 'get' | 'modify' | 'delete'
	id?: string
	document?: Record<string, unknown>
	documentType?: string
}[]`,
					example: [{
						document: {
							text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
							title: 'The standard Lorem Ipsum passage, used since the 1500s',
							uri: 'https://www.example.com'
						}
					}, {
						action: 'get',
						id: '1',
					}, {
						id: '1',
						document: {
							text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
							title: 'Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC',
							uri: 'https://www.example.com'
						}
					}, {
						action: 'delete',
						id: '1',
					}]
				}],
				list: true,
				type: `{
	action: 'create' | 'get' | 'modify' | 'delete'
	id: string
	document?: Record<string, unknown>
}[]`
			}}
			headers={{
				authorization: {
					value: `Explorer-Api-Key ${apiKey}`,
					attributes: '<required>',
					description: 'The API key (password) for the collection you want to create or modify document(s) in.'
				},
				'content-type': {
					value: 'application/json;charset=utf-8',
					attributes: '<required>',
					description: "The content type of the body. It must be application/json;charset=utf-8."
				},
			}}
			method="POST"
			parameters={{
				documentType: {
					description: <>The documentType is selected in the following order:
					<ol>
						{/* <li>documentTypeId property on each document in the body json.</li> */}
						<li>documentType property on each item in the body json.</li>
						{/* <li>documentTypeId url query parameter.</li> */}
						<li>documentType url query.</li>
						<li>documentTypeId property stored on the collection node.</li>
					</ol>
					If it's not provided by any of these ways, the document will NOT be created or modifed.
					</>,
					list: false,
					required: false,
					type: 'string'
				},
				// partial: { // TODO Not supported by the backend yet.
				// 	default: false,
				// 	description: 'When true, values are only added or modified. Unprovided values are not removed.',
				// 	list: false,
				// 	required: false,
				// 	type: 'boolean'
				// },
				requireValid: {
					default: true,
					description: 'The data has to be valid, according to the field types, to be created or modified. If requireValid=true and the data is not strictly valid, an error will be returned.',
					list: false,
					required: false,
					type: 'boolean'
				},
				returnDocument: {
					default: false,
					description: 'When true, the created or modified document(s) will be returned in the response, not just the id.',
					list: false,
					required: false,
					type: 'boolean'
				},
			}}
			pattern={`${prefix}`}
			responses={[{
				status: 200,
				body: [{
					action: 'create',
					id: '1',
					// document: {
					// 	key: 'value'
					// },
					status: 200
				},{
					id: '2',
					action: 'modify',
					// document: {
					// 	key: 'value'
					// },
					status: 200
				},{
					action: 'create',
					error: 'Something went wrong while trying to create a document!',
					status: 500
				},{
					action: 'modify',
					error: "Document with id '2' not found in collection 'collectionName'!",
					status: 404
				},{
					action: 'modify',
					error: "Something went wrong while trying to modify document with id '5'!",
					status: 500
				},{
					action: 'delete',
					collection: 'collectionName',
					collector: {
						id: 'com.enonic.app.explorer:documentRestApi',
						version: '2.0.0'
					},
					createdTime:"2023-08-21T11:31:38.141Z",
					document: {
						key: 'value'
					},
					documentType: 'documentTypeName',
					id: '1',
					language: 'en',
					modifiedTime:"2023-08-22T11:31:38.141Z",
					status: 200,
					stemmingLanguage: 'en',
					valid: true
				}, {
					action: 'delete',
					id: '2',
					error: "Unable to find document with id = 2!",
					status: 404,
				}]
			}]}
		/>

		<Action
			name='query-documents'
			apiKey={apiKey}
			comment='Query document(s)'
			curl={`-H "authorization:Explorer-Api-Key ${apiKey}" -H "content-type:application/json"`}
			data={{
				default: `{
	"count": 10,
	"filters": {
		"boolean": {
			"must": [{
				"exists": {
					"field": "url"
				}
			}]
		}
	},
	"query": {
		"boolean": {
			"must": [{
				"term": {
					"field": "url",
					"value": "https://enonic.com"
				}
			}]
		}
	},
	"sort": {
		"field": "_score",
		"direction": "DESC"
	},
	"start": 0
}`,
				examples: [{
					comment: 'Query for all document(s)',
					type: 'object',
					example: {
						count: 10,
						query: {
							matchAll: {}
						},
						sort: {
							field: '_score',
							direction: 'DESC'
						},
						start: 0,
					}
				},{
					comment: 'Query for document(s) with url',
					type: 'object',
					example: {
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
						sort: {
							field: '_score',
							direction: 'DESC'
						},
						start: 0,
					}
				},{
					comment: 'Query for document(s) with url = https://enonic.com',
					type: 'object',
					example: {
						count: 10,
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
							field: '_score',
							direction: 'DESC'
						},
						start: 0,
					}
				}],
				list: false,
				type: 'object'
			}}
			headers={{
				authorization: {
					value: `Explorer-Api-Key ${apiKey}`,
					attributes: '<required>',
					description: 'The API key (password) for the collection you want to query for document(s) in.'
				},
				'content-type': {
					value: 'application/json;charset=utf-8',
					attributes: '<required>',
					description: "The content type of the body. It must be application/json;charset=utf-8."
				},
			}}
			method="POST"
			parameters={{
				returnDocument: {
					default: false,
					description: 'When true, the document(s) will be returned in the response, not just the id(s).',
					list: false,
					required: false,
					type: 'boolean'
				},
			}}
			pattern={`${prefix}/query`}
			responses={[{
				status: 200,
				body: {
					count: 0,
					total: 0,
					hits: [{
						id: '1',
						collection: 'collectionName',
						document: {}
					}]
				}
			}]}
		/>

		<Action
			name='delete-documents'
			apiKey={apiKey}
			comment='Delete document(s)'
			curl={`-H "authorization:Explorer-Api-Key ${apiKey}"`}
			headers={{
				authorization: {
					value: `Explorer-Api-Key ${apiKey}`,
					attributes: '<required>',
					description: 'The API key (password) for the collection you want to delete document(s) from.'
				},
			}}
			method="DELETE"
			parameters={{
				id: {
					default: ['1', '2'],
					description: 'The id of the document to delete. Can be provided multiple times.',
					list: true,
					required: true,
					type: 'string'
				},
				returnDocument: {
					default: false,
					description: 'When true, the document(s) will be returned in the response, not just the id(s).',
					list: false,
					required: false,
					type: 'boolean'
				},
			}}
			pattern={`${prefix}`}
			responses={[{
				body: [{
					action: 'delete',
					collection: 'collectionName',
					collector: {
						id: 'com.enonic.app.explorer:documentRestApi',
						version: '2.0.0'
					},
					createdTime:"2023-08-21T11:31:38.141Z",
					document: {
						key: 'value'
					},
					documentType: 'documentTypeName',
					id: '1',
					language: 'en',
					modifiedTime:"2023-08-22T11:31:38.141Z",
					status: 200,
					stemmingLanguage: 'en',
					valid: true
				}, {
					action: 'delete',
					id: '2',
					error: "Unable to find document with id = 2!",
					status: 404,
				}],
				status: 200
			}]}
		/>

		<h2>Single</h2>

		<Form>
			<Form.Input
				label='Document ID'
				placeholder='Document ID'
				onChange={(_, { value }) => setDocumentId(value)}
			/>
		</Form>

		<Action
			name='get-document'
			apiKey={apiKey}
			curl={`-H "authorization:Explorer-Api-Key ${apiKey}"`}
			comment='Get a document'
			headers={{
				authorization: {
					value: `Explorer-Api-Key ${apiKey}`,
					attributes: '<required>',
					description: 'The API key (password) for the collection you want to get a document from.'
				},
			}}
			method="GET"
			pattern={documentPath}
			responses={[{
				status: 200,
				body: {
					id: '1'
				}
			}, {
				status: 404,
				body: {
					error: 'Document with id "1" doesn\'t exist in collection "collectionName"!'
				}
			}]}
		/>

		<Action
			name='patch-document'
			apiKey={apiKey}
			curl={`-H "authorization:Explorer-Api-Key ${apiKey}" -H "content-type:application/json"`}
			comment='Patch a document'
			data={{
				default: `{
	"document": {
		"available": false,
		"count": 0,
		"date": "2023-01-01",
		"datetime": "2023-01-01T00:00:00",
		"instant": "2023-01-01T00:00:00Z",
		"location": "59.9090442,10.7423389",
		"price": 0,
		// "time": "00:00:00",
		"language": "norsk",
		"text": "Hei!",
		"title": "Tittel",
		"url": "https://www.example.no"
	},
	// "documentType": "documentTypeName",
}`,
				examples: [{
					comment: 'Patch a document',
					type: `{
	document: Record<string, unknown>
}`,
					example: {
						document: {
							text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
							title: 'Hello World',
							uri: 'https://www.example.com'
						}
					}
				}],
				list: false,
				type: `{
	document: Record<string, unknown>
}`
			}}
			headers={{
				authorization: {
					value: `Explorer-Api-Key ${apiKey}`,
					attributes: '<required>',
					description: 'The API key (password) for the collection you want to create or modify a document in.'
				},
				'content-type': {
					value: 'application/json;charset=utf-8',
					attributes: '<required>',
					description: "The content type of the body. It must be application/json;charset=utf-8."
				},
			}}
			method="POST"
			parameters={{
				documentType: {
					description: <>The documentType is selected in the following order:
					<ol>
						{/* <li>documentTypeId property on each document in the body json.</li> */}
						<li>documentType property on each item in the body json.</li>
						{/* <li>documentTypeId url query parameter.</li> */}
						<li>documentType url query.</li>
						<li>documentTypeId property stored on the collection node.</li>
					</ol>
					If it's not provided by any of these ways, the document will NOT be created or modified.
					</>,
					list: false,
					required: false,
					type: 'string'
				},
				// partial: {
				// 	default: false,
				// 	description: 'When true, values are only added or modified. Unprovided values are not removed.',
				// 	list: false,
				// 	required: false,
				// 	type: 'boolean'
				// },
				requireValid: {
					default: true,
					description: 'The data has to be valid, according to the field types, to be created or modified. If requireValid=true and the data is not strictly valid, an error will be returned.',
					list: false,
					required: false,
					type: 'boolean'
				},
				returnDocument: {
					default: false,
					description: 'When true, the patched document will be returned in the response, not just the id.',
					list: false,
					required: false,
					type: 'boolean'
				},
			}}
			pattern={documentPath}
		/>

		<Action
			name='delete-document'
			apiKey={apiKey}
			curl={`-H "authorization:Explorer-Api-Key ${apiKey}"`}
			comment='Delete a document'
			headers={{
				authorization: {
					value: `Explorer-Api-Key ${apiKey}`,
					attributes: '<required>',
					description: 'The API key (password) for the collection you want to delete a document from.'
				},
			}}
			method="DELETE"
			pattern={documentPath}
			responses={[{
				body: {
					collection: 'collectionName',
					collector: {
						id: 'com.enonic.app.explorer:documentRestApi',
						version: '2.0.0'
					},
					createdTime:"2023-08-21T11:31:38.141Z",
					document: {
						key: 'value'
					},
					documentType: 'documentTypeName',
					id: '1',
					language: 'en',
					modifiedTime:"2023-08-22T11:31:38.141Z",
					stemmingLanguage: 'en',
					valid: true
				},
				status: 200,
			}, {
				status: 404,
				body: {
					id: '1',
					error: 'Document with id "1" does not exist in collection "collectionName"!'
				}
			}]}
		/>
	</Segment>;
}
