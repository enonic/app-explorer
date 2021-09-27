import {generateCreateThesaurusField} from './generateCreateThesaurusField';
import {generateDeleteThesaurusField} from './generateDeleteThesaurusField';
import {generateQueryThesauriField} from './generateQueryThesauriField';
import {generateThesaurusTypes} from './generateThesaurusTypes';
import {generateUpdateThesaurusField} from './generateUpdateThesaurusField';


export function generateThesaurusFields({
	GQL_TYPE_COUNT,
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	//GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	GQL_TYPE_SYNONYM,
	GQL_TYPE_TOTAL,
	schemaGenerator
}) {
	const {
		GQL_INPUT_TYPE_THESAURUS_LANGUAGE,
		GQL_TYPE_THESAURUS,
		GQL_TYPE_THESAURUS_LANGUAGE
	} = generateThesaurusTypes({
		GQL_TYPE_ID,
		GQL_TYPE_NAME,
		//GQL_TYPE_NODE_TYPE,
		GQL_TYPE_PATH,
		schemaGenerator
	});
	return {
		createThesaurusField: generateCreateThesaurusField({
			GQL_INPUT_TYPE_THESAURUS_LANGUAGE,
			GQL_TYPE_THESAURUS
		}),
		deleteThesaurusField: generateDeleteThesaurusField({
			GQL_TYPE_ID,
			schemaGenerator
		}),
		queryThesauriField: generateQueryThesauriField({
			GQL_TYPE_COUNT,
			GQL_TYPE_ID,
			GQL_TYPE_NAME,
			//GQL_TYPE_NODE_TYPE,
			GQL_TYPE_PATH,
			GQL_TYPE_SYNONYM,
			GQL_TYPE_THESAURUS_LANGUAGE,
			GQL_TYPE_TOTAL,
			schemaGenerator
		}),
		updateThesaurusField: generateUpdateThesaurusField({
			GQL_INPUT_TYPE_THESAURUS_LANGUAGE,
			GQL_TYPE_THESAURUS
		})
	};
}
