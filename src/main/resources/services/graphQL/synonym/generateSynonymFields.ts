import {addSynonymTypes} from './addSynonymTypes';
import {addMutationSynonymCreate} from './addMutationSynonymCreate';
import {addMutationSynonymUpdate} from './addMutationSynonymUpdate';
import {generateDeleteSynonymField} from './generateDeleteSynonymField';
import {generateQuerySynonymsField} from './generateQuerySynonymsField';


export function generateSynonymFields({
	glue
}) {
	addSynonymTypes({glue});
	addMutationSynonymCreate({glue});
	addMutationSynonymUpdate({glue});
	return {
		deleteSynonymField: generateDeleteSynonymField({
			glue
		}),
		querySynonymsField: generateQuerySynonymsField({
			glue
		})
	}; // return
} // generateSynonymField
