import {generateDeleteThesaurusField} from './generateDeleteThesaurusField';
import {generateQueryThesauriField} from './generateQueryThesauriField';


export function generateThesaurusFields({
	glue
}) {
	return {
		deleteThesaurusField: generateDeleteThesaurusField({
			glue
		}),
		queryThesauriField: generateQueryThesauriField({
			glue
		})
	};
}
