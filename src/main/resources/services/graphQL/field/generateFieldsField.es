import {generateCreateFieldField} from './generateCreateFieldField';
import {generateFieldTypes} from './generateFieldTypes';
import {generateDeleteFieldField} from './generateDeleteFieldField';
import {generateQueryFieldsField} from './generateQueryFieldsField';
import {generateUpdateFieldField} from './generateUpdateFieldField';


export function generateFieldsField({
	//GQL_INTERFACE_NODE,
	GQL_TYPE_ID,
	glue,
	schemaGenerator
}) {
	const {
		GQL_TYPE_FIELD_NODE,
		GQL_TYPE_FIELDS_QUERY_RESULT
	} = generateFieldTypes({
		//GQL_INTERFACE_NODE,
		glue
	});
	return {
		//GQL_TYPE_FIELD_NODE,
		createFieldField: generateCreateFieldField({
			//GQL_INTERFACE_NODE,
			GQL_TYPE_FIELD_NODE
		}),
		deleteFieldField: generateDeleteFieldField({
			GQL_TYPE_ID,
			schemaGenerator
		}),
		queryFieldsField: generateQueryFieldsField({
			GQL_TYPE_FIELDS_QUERY_RESULT
		}),
		updateFieldField: generateUpdateFieldField({
			GQL_TYPE_ID,
			GQL_TYPE_FIELD_NODE
		})
	};
}
