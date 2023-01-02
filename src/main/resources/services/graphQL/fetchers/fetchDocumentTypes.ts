import type {
	Collection,
	DocumentType
} from '/lib/explorer/types/index.d';
//import type {JSONResponse}  from './index.d';


import * as gql from 'gql-query-builder';
import {
	FIELD_SHORTCUT_COLLECTION,
	FIELD_SHORTCUT_DOCUMENT_TYPE
} from '../constants';

export type QueryDocumentTypesHit = DocumentType & {
	_referencedBy :{
		count :number
		hits :Array<Collection>
		total :number
	}
};

export type QueryDocumentTypesHits = Array<QueryDocumentTypesHit>;

type Aggregation = {
	name :string
	buckets :Array<{
		docCount :number
		key :string
		aggregations ?:Array<Aggregation>
	}>
}

export type FetchQueryDocumentTypesData = {
	queryDocuments :{
		aggregations :Array<Aggregation>
	}
	queryDocumentTypes :{
		count :number
		hits :QueryDocumentTypesHits
		total :number
	}
}


export function fetchDocumentTypes({
	url,
	handleData = () => {/**/},
} :{
	handleData :(data :FetchQueryDocumentTypesData) => void
	url :string,
}) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify(gql.query([{
			operation: 'queryDocumentTypes',
			fields: [{
				hits: [
					'_id',
					'_name',
					'_nodeType',
					'_path',
					'_versionKey',
					'addFields',
					'managedBy',
					{
						properties: [
							'active',
							'enabled',
							'fulltext',
							'includeInAllText',
							'max',
							'min',
							'name',
							'nGram',
							'path',
							'valueType'
						]
					}
				]
			}]
		}, {
			operation: 'queryDocuments',
			variables: {
				aggregations: {
					list: true,
					required: true,
					type: 'AggregationInput',
					value: [
						// {
						// 	name: 'collection',
						// 	terms: {
						// 		field: 'collectionName',
						// 		order: 'count DESC',
						// 		size: 0, // Seems to mean infinite (undocumented)
						// 		minDocCount: 1
						// 	}
						// },
						{
							name: 'documentType',
							subAggregations: {
								name: 'documentTypeCollection',
								terms: {
									field: FIELD_SHORTCUT_COLLECTION,
									order: 'count DESC',
									size: 0, // Seems to mean infinite (undocumented)
									minDocCount: 1,
								}
							},
							terms: {
								field: FIELD_SHORTCUT_DOCUMENT_TYPE,
								order: 'count DESC',
								size: 0, // Seems to mean infinite (undocumented)
								minDocCount: 1
							}
						}
					]
				},
				count: {
					required: false,
					type: 'Int',
					value: 0
				},
				query: {
					required: true,
					type: 'QueryDSL',
					value: {
						matchAll: {}
					}
				}
			},
			fields: [{
				aggregations: [
					'name',
					{
						buckets: [
							'docCount',
							'key',
							{
								aggregations: [
									'name',
									{
										buckets: [
											'docCount',
											'key'
										]
									}
								]
							}
						]
					}
				]
			}]
		}]))
	})
		.then(response => response.json())
		.then(json => {
			//console.debug('json', json);
			handleData(json.data);
		});
}
