import {generateCollectionTypes} from './generateCollectionTypes';
import {generateCreateCollectionField} from './generateCreateCollectionField';
import {generateQueryCollectionsField} from './generateQueryCollectionsField';
import {generateReindexCollectionsField} from './generateReindexCollectionsField';
import {generateUpdateCollectionField} from './generateUpdateCollectionField';


export function generateCollectionFields({
	glue
}) {
	generateCollectionTypes({
		glue
	});
	return {
		createCollectionField: generateCreateCollectionField({
			glue
		}),
		queryCollectionsField: generateQueryCollectionsField({
			glue
		}),
		reindexCollectionsField: generateReindexCollectionsField({
			glue
		}),
		updateCollectionField: generateUpdateCollectionField({
			glue
		})
	}; // return
} // generateCollectionFields
