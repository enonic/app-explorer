import {generateCreateSynonymField} from './generateCreateSynonymField';
import {generateDeleteSynonymField} from './generateDeleteSynonymField';
import {generateQuerySynonymsField} from './generateQuerySynonymsField';
import {generateSynonymTypes} from './generateSynonymTypes';
import {generateUpdateSynonymField} from './generateUpdateSynonymField';


export function generateSynonymFields({
	glue
}) {

	const {
		GQL_TYPE_FROM,
		GQL_TYPE_TO
	} = generateSynonymTypes({
		glue
	});

	return {
		createSynonymField: generateCreateSynonymField({
			GQL_TYPE_FROM,
			GQL_TYPE_TO,
			glue
		}),
		deleteSynonymField: generateDeleteSynonymField({
			glue
		}),
		querySynonymsField: generateQuerySynonymsField({
			glue
		}),
		updateSynonymField: generateUpdateSynonymField({
			GQL_TYPE_FROM,
			GQL_TYPE_TO,
			glue
		})
	}; // return

} // generateSynonymField
