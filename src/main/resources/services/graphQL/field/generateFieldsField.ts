import {generateCreateFieldField} from './generateCreateFieldField';
import {generateFieldTypes} from './generateFieldTypes';
import {generateDeleteFieldField} from './generateDeleteFieldField';
import {generateQueryFieldsField} from './generateQueryFieldsField';
import {generateUpdateFieldField} from './generateUpdateFieldField';


export function generateFieldsField({
	glue
}) {
	generateFieldTypes({
		glue
	});
	return {
		createFieldField: generateCreateFieldField({
			glue
		}),
		deleteFieldField: generateDeleteFieldField({
			glue
		}),
		queryFieldsField: generateQueryFieldsField({
			glue
		}),
		updateFieldField: generateUpdateFieldField({
			glue
		})
	};
}
