import {generateCreateDocumentTypeField} from './generateCreateDocumentTypeField';
import {generateDeleteDocumentTypeField} from './generateDeleteDocumentTypeField';
import {generateDocumentTypeTypes} from './generateDocumentTypeTypes';
import {generateGetDocumentTypeField} from './generateGetDocumentTypeField';
import {generateQueryDocumentTypesField} from './generateQueryDocumentTypesField';
import {generateUpdateDocumentTypeField} from './generateUpdateDocumentTypeField';


export function generateDocumentTypeFields({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_PATH,
	GQL_TYPE_VERSION_KEY,
	schemaGenerator
}) {
	const {
		GQL_INPUT_TYPE_ADD_FIELDS,
		GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS,
		GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES,
		GQL_TYPE_DOCUMENT_TYPE
	} = generateDocumentTypeTypes({
		GQL_TYPE_ID,
		GQL_TYPE_NAME,
		GQL_TYPE_PATH,
		GQL_TYPE_VERSION_KEY,
		schemaGenerator
	});
	return {
		createDocumentTypeField: generateCreateDocumentTypeField({
			GQL_INPUT_TYPE_ADD_FIELDS,
			GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS,
			GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES,
			GQL_TYPE_DOCUMENT_TYPE,
			GQL_TYPE_NAME
		}),
		deleteDocumentTypeField: generateDeleteDocumentTypeField({
			GQL_TYPE_ID,
			schemaGenerator
		}),
		getDocumentTypeField: generateGetDocumentTypeField({
			GQL_TYPE_DOCUMENT_TYPE,
			GQL_TYPE_ID
		}),
		queryDocumentTypesField: generateQueryDocumentTypesField({
			GQL_TYPE_DOCUMENT_TYPE,
			schemaGenerator
		}),
		updateDocumentTypeField: generateUpdateDocumentTypeField({
			GQL_INPUT_TYPE_ADD_FIELDS,
			GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS,
			GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES,
			GQL_TYPE_DOCUMENT_TYPE,
			GQL_TYPE_ID,
			GQL_TYPE_NAME
		})
	};
} // generateDocumentTypeFields
