import {generateCreateDocumentTypeField} from './generateCreateDocumentTypeField';
import {generateDeleteDocumentTypeField} from './generateDeleteDocumentTypeField';
import {generateDocumentTypeTypes} from './generateDocumentTypeTypes';
import {generateGetDocumentTypeField} from './generateGetDocumentTypeField';
import {generateQueryDocumentTypesField} from './generateQueryDocumentTypesField';
import {generateUpdateDocumentTypeField} from './generateUpdateDocumentTypeField';


export function generateDocumentTypeFields({
	glue
}) {
	const {GQL_INPUT_TYPE_ADD_FIELDS} = generateDocumentTypeTypes({
		glue
	});
	return {
		createDocumentTypeField: generateCreateDocumentTypeField({
			GQL_INPUT_TYPE_ADD_FIELDS,
			glue
		}),
		deleteDocumentTypeField: generateDeleteDocumentTypeField({
			glue
		}),
		getDocumentTypeField: generateGetDocumentTypeField({
			glue
		}),
		queryDocumentTypesField: generateQueryDocumentTypesField({
			glue
		}),
		updateDocumentTypeField: generateUpdateDocumentTypeField({
			GQL_INPUT_TYPE_ADD_FIELDS,
			glue
		})
	};
} // generateDocumentTypeFields
