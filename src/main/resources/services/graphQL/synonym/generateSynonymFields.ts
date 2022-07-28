import {addSynonymTypes} from './addSynonymTypes';
import {addMutationSynonymCreate} from './addMutationSynonymCreate';
import {addMutationSynonymUpdate} from './addMutationSynonymUpdate';
import {addQuerySynonymsField} from './addQuerySynonymsField';
import {addGetSynonym} from './addGetSynonym';
import {generateDeleteSynonymField} from './generateDeleteSynonymField';


export function generateSynonymFields({
	glue
}) {
	addSynonymTypes({glue});
	addMutationSynonymCreate({glue});
	addMutationSynonymUpdate({glue});
	addQuerySynonymsField({glue});
	addGetSynonym({glue});
	return {
		deleteSynonymField: generateDeleteSynonymField({
			glue
		}),
	}; // return
} // generateSynonymField
