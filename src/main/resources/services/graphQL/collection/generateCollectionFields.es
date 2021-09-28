import {generateCollectionTypes} from './generateCollectionTypes';
import {generateCreateCollectionField} from './generateCreateCollectionField';
import {generateQueryCollectionsField} from './generateQueryCollectionsField';
import {generateReindexCollectionsField} from './generateReindexCollectionsField';
import {generateUpdateCollectionField} from './generateUpdateCollectionField';


export function generateCollectionFields({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	schemaGenerator
}) {
	const {
		GQL_INPUT_TYPE_COLLECTOR,
		GQL_INPUT_TYPE_CRON,
		GQL_TYPE_COLLECTION,
		GQL_TYPE_COLLECTION_QUERY_RESULT,
		GQL_TYPE_REINDEX_COLLECTIONS_REPORT
	} = generateCollectionTypes({
		GQL_TYPE_ID,
		GQL_TYPE_NAME,
		GQL_TYPE_NODE_TYPE,
		schemaGenerator
	});
	return {
		GQL_TYPE_COLLECTION,
		createCollectionField: generateCreateCollectionField({
			GQL_TYPE_NAME,
			GQL_INPUT_TYPE_COLLECTOR,
			GQL_INPUT_TYPE_CRON,
			GQL_TYPE_COLLECTION
		}),
		queryCollectionsField: generateQueryCollectionsField({
			GQL_TYPE_COLLECTION_QUERY_RESULT
		}),
		reindexCollectionsField: generateReindexCollectionsField({
			GQL_TYPE_REINDEX_COLLECTIONS_REPORT
		}),
		updateCollectionField: generateUpdateCollectionField({
			GQL_TYPE_ID,
			GQL_TYPE_NAME,
			GQL_INPUT_TYPE_COLLECTOR,
			GQL_INPUT_TYPE_CRON,
			GQL_TYPE_COLLECTION
		})
	}; // return
} // generateCollectionFields
