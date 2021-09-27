import {generateCreateSynonymField} from './generateCreateSynonymField';
import {generateDeleteSynonymField} from './generateDeleteSynonymField';
import {generateQuerySynonymsField} from './generateQuerySynonymsField';
import {generateSynonymTypes} from './generateSynonymTypes';
import {generateUpdateSynonymField} from './generateUpdateSynonymField';


export function generateSynonymFields({
	GQL_TYPE_ID,
	//GQL_TYPE_NAME,
	GQL_TYPE_NODE_DELETED,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	schemaGenerator
}) {

	const {
		GQL_TYPE_FROM,
		GQL_TYPE_TO,
		GQL_TYPE_OBJECT_SYNONYMS_QUERY,
		GQL_TYPE_SYNONYM
	} = generateSynonymTypes({
		GQL_TYPE_ID,
		//GQL_TYPE_NAME,
		GQL_TYPE_NODE_TYPE,
		GQL_TYPE_PATH,
		schemaGenerator
	});

	return {
		GQL_TYPE_SYNONYM,
		createSynonymField: generateCreateSynonymField({
			GQL_TYPE_FROM,
			GQL_TYPE_ID,
			GQL_TYPE_TO,
			GQL_TYPE_SYNONYM
		}),
		deleteSynonymField: generateDeleteSynonymField({
			GQL_TYPE_ID,
			GQL_TYPE_NODE_DELETED
		}),
		querySynonymsField: generateQuerySynonymsField({
			GQL_TYPE_OBJECT_SYNONYMS_QUERY,
			schemaGenerator
		}),
		updateSynonymField: generateUpdateSynonymField({
			GQL_TYPE_FROM,
			GQL_TYPE_ID,
			GQL_TYPE_TO,
			GQL_TYPE_SYNONYM
		})
	}; // return

} // generateSynonymField
