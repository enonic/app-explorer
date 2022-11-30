import {addCollectionCopyMutation} from './addCollectionCopyMutation';
import {addQueryCollections} from './addQueryCollections';
import {generateCollectionTypes} from './generateCollectionTypes';
import {generateCreateCollectionField} from './generateCreateCollectionField';
import {generateReindexCollectionsField} from './generateReindexCollectionsField';
import {generateUpdateCollectionField} from './generateUpdateCollectionField';


export function generateCollectionFields({
	glue
}) {
	generateCollectionTypes({glue});
	addCollectionCopyMutation({glue});
	addQueryCollections({glue});
	return {
		createCollectionField: generateCreateCollectionField({glue}),
		reindexCollectionsField: generateReindexCollectionsField({glue}),
		updateCollectionField: generateUpdateCollectionField({glue})
	}; // return
} // generateCollectionFields
