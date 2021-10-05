import {generateQueryDocumentTypesField} from './documentType/generateQueryDocumentTypesField';


export function createObjectTypesUsingUnionTypes({glue}) {
	return {
		queryDocumentTypesField: generateQueryDocumentTypesField({
			glue
		})
	};
} // createObjectTypesUsingUnionTypes
