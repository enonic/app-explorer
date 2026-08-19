import type {InterfaceField} from '@enonic-types/lib-explorer';
import type {Expressions, TermQuery} from '@enonic-types/lib-explorer/Interface.d';
import type Fields from 'gql-query-builder-ts/build/Fields';
import type VariableOptions from 'gql-query-builder-ts/build/VariableOptions';

import * as gql from 'gql-query-builder-ts';
import {
	GQL_INPUT_TYPE_INTERFACE_EXPRESSIONS_NAME,
	GQL_INPUT_TYPE_INTERFACE_FIELD_NAME,
	GQL_INPUT_TYPE_INTERFACE_TERM_QUERY_NAME,
} from '../../main/resources/services/graphQL/constants';


type JSONResponse = {
	data?: unknown;
	errors?: {message: string}[];
}

export interface FetchInterfaceVariables {
	_name?: string;
	collectionIds?: string[];
	expressions?: Expressions;
	fields?: InterfaceField[];
	stopWords?: string[];
	synonymIds?: string[];
	termQueries?: TermQuery[];
}

interface FetchInterfaceCreateParams {
	url: string;
	variables: FetchInterfaceVariables;
	handleData?: (data: unknown) => void;
	handleResponse?: (response: Response) => void;
}


export const FETCH_INTERFACE_FIELDS: Fields = [
	'_id',
	'_name',
	'_nodeType',
	'_path',
	'_versionKey',
	'collectionIds',
	{
		expressions: [
			{
				'fulltext': [
					'boost',
					'disabled',
				]
			}, {
				'stemmed': [
					'boost',
					'disabled',
				]
			}, {
				'nGram': [
					'boost',
					'disabled',
				]
			}
		]
	},
	{
		fields: [
			'boost',
			'name',
		]
	},
	// 'stopWordIds',
	'stopWords',
	'synonymIds',
	{
		termQueries: [
			'boost',
			'field',
			'type',
			'booleanValue',
			'doubleValue',
			'longValue',
			'stringValue',
		]
	}
];

export const FETCH_JSON_HEADERS: HeadersInit = { // HTTP/2 uses lowercase header keys
	'content-type':	'application/json'
};


export function getFetchInterfaceVariableOptions({
	_name,
	collectionIds = [],
	expressions,
	fields = [],
	//stopWordIds = [],
	stopWords = [],
	synonymIds = [],
	termQueries = [],
}: FetchInterfaceVariables): VariableOptions {
	return {
		_name: {
			list: false,
			required: true,
			type: 'String',
			value: _name
		},
		collectionIds: {
			list: true,
			required: false,
			type: 'ID',
			value: collectionIds
		},
		expressions: {
			list: false,
			required: false,
			type: GQL_INPUT_TYPE_INTERFACE_EXPRESSIONS_NAME,
			value: expressions,
		},
		fields: {
			list: true,
			required: false,
			type: GQL_INPUT_TYPE_INTERFACE_FIELD_NAME,
			value: fields
		},
		//stopWordIds,
		stopWords: {
			list: true,
			required: false,
			type: 'String',
			value: stopWords
		},
		synonymIds: {
			list: true,
			required: false,
			type: 'ID',
			value: synonymIds
		},
		termQueries: {
			list: true,
			required: false,
			type: GQL_INPUT_TYPE_INTERFACE_TERM_QUERY_NAME,
			value: termQueries
		}
	};
}


export function fetchInterfaceCreate({
	url,
	variables: {
		_name,
		collectionIds = [],
		expressions,
		fields = [],
		//stopWordIds = [],
		stopWords = [],
		synonymIds = [],
		termQueries = [],
	} = {},
	handleData = (data) => {
		// This will only be called if neither handleResponse nor handleData is passed in...
		console.debug('fetchInterfaceCreate(',{url, variables:{
			_name, collectionIds,fields, stopWords,synonymIds
		}},') --> data:', data);
	},
	handleResponse = (response) => {
		//console.debug('fetchInterfaceCreate({url:', url, ', variables:', variables, '}) --> response:', response);
		handleData((response.json() as JSONResponse).data);
	}
}: FetchInterfaceCreateParams) {
	// console.debug('fetchInterfaceCreate({url:', url, ', variables:', variables, '})');
	fetch(url, {
		method: 'POST',
		headers: FETCH_JSON_HEADERS,
		body: JSON.stringify(gql.mutation({
			operation: 'createInterface',
			variables: getFetchInterfaceVariableOptions({
				_name,
				collectionIds,
				expressions,
				fields,
				stopWords,
				synonymIds,
				termQueries,
			}),
			fields: FETCH_INTERFACE_FIELDS,
		}))
	})
		.then(response => handleResponse(response));
}
/* Example query variables:
{
	"_name": "a",
	"collectionIds": "556e04a5-dbb5-4db4-92c1-afb2fc031e2b",
	"fields": {
		"boost": 3,
		"name": "extra"
	},
	"stopWordIds": "ecbaf718-acf7-4ef7-869e-86afa1ab33d7",
	"synonymIds": "3b46ba9f-e8bd-4639-b1ac-d33911b9c1cf",
	"termQueries": {
		boost: 1.1,
		field: 'field',
		type: 'string',
		booleanValue: true,
		doubleValue: 1.1,
		longValue: 1,
		stringValue: 'stringValue'
	}
}
*/
