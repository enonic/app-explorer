import type {FetchQueryDocumentTypesData} from '../../../services/graphQL/fetchers/fetchDocumentTypes';
import type {DocumentTypesObj} from './index.d';


// import {toStr} from '@enonic/js-utils';


export function buildDocumentTypesObj(data :FetchQueryDocumentTypesData) {
	const {
		queryDocuments: {
			aggregations = []
		},
		queryDocumentTypes: {
			hits: documentTypeHits
		}
	} = data;

	const documentTypeCounts = {} as Record<string,{
		docCount :number
		collections :Array<{
			name :string
			docCount :number
		}>
	}>;

	for (let i = 0; i < aggregations.length; i++) {
		const {
			name,
			buckets = []
		} = aggregations[i];
		if (name === 'documentType') {
			for (let j = 0; j < buckets.length; j++) {
				const {
					docCount = 0,
					key,
					aggregations: subAggregations = []
				} = buckets[j];
				let collections = [];
				for (let k = 0; k < subAggregations.length; k++) {
					const {
						name: subAggregationName,
						buckets: subAggregationBuckets
					} = subAggregations[k];
					if (subAggregationName === 'documentTypeCollection') {
						collections = subAggregationBuckets.map(({
							docCount: subAggregationDocCount = 0,
							key: subAggregationKey
						}) => ({
							name: subAggregationKey,
							docCount: subAggregationDocCount
						}))
					}
				} // for subAggregations[k]
				documentTypeCounts[key] = {
					docCount,
					collections
				}
			} // for buckets[j]
		}
	} // for aggregations[i]
	// console.debug('documentTypeCounts', documentTypeCounts);

	const documentTypes :DocumentTypesObj = {};
	for (let i = 0; i < documentTypeHits.length; i++) {
		const {
			_name,
			properties,
			...rest
		} = documentTypeHits[i];
		const activeProperties = properties.filter(({active}) => active);
		const activePropertyNames = activeProperties.map(({name})=>name).sort();
		documentTypes[_name] = {
			_name,
			activeProperties,
			activePropertyNames,
			collectionNames: documentTypeCounts[_name] ? documentTypeCounts[_name].collections.map(({name}) => name) : [],
			collections: documentTypeCounts[_name] ? documentTypeCounts[_name].collections : [],
			documentsInTotal: documentTypeCounts[_name] ? documentTypeCounts[_name].docCount : 0,
			// TODO: Should interfaceNames be added here? Or be removed from types and NewOrEditDocumentType and FieldsList
			...rest
		};
	} // for

	return documentTypes;
}
