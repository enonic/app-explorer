import {generateCreateThesaurusField} from './generateCreateThesaurusField';
import {generateDeleteThesaurusField} from './generateDeleteThesaurusField';
import {generateQueryThesauriField} from './generateQueryThesauriField';
import {generateThesaurusTypes} from './generateThesaurusTypes';
import {generateUpdateThesaurusField} from './generateUpdateThesaurusField';


export function generateThesaurusFields({
	glue
}) {
	generateThesaurusTypes({
		glue
	});
	return {
		createThesaurusField: generateCreateThesaurusField({
			glue
		}),
		deleteThesaurusField: generateDeleteThesaurusField({
			glue
		}),
		queryThesauriField: generateQueryThesauriField({
			glue
		}),
		updateThesaurusField: generateUpdateThesaurusField({
			glue
		})
	};
}
