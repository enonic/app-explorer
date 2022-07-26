//import {toStr} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/thesaurus/query';

import {GQL_TYPE_THESAURI_QUERY_RESULT} from '../constants';
import {querySynonyms} from '../synonym/querySynonyms';


export function generateQueryThesauriField({
	glue
}) {

	return {
		resolve: (/*env*/) => {
			//log.info(`env:${toStr(env)}`);
			const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
			const thesauriRes = query({
				connection
			});
			thesauriRes.hits = thesauriRes.hits.map(({
				_id,
				_name,
				_nodeType,
				_path,
				allowedLanguages,
				description,
				synonymsCount,
				_versionKey
			}) => ({
				_id,
				_name,
				_nodeType,
				_path,
				allowedLanguages,
				description,
				synonyms: querySynonyms({
					count: 0, // No need to fetch any data
					filters: {
						boolean: {
							must: {
								hasValue: {
									field: 'thesaurusReference',
									values: [_id]
								}
							}
						}
					},
					query: ''
				}),
				synonymsCount,
				_versionKey
			}));
			return thesauriRes;
		},
		type: glue.getObjectType(GQL_TYPE_THESAURI_QUERY_RESULT)
	};
}

/* Example query
{
	queryThesauri {
		total
		count
		hits {
			_id
			_name
			_nodeType
			_path
			description
			#displayName
			allowedLanguages
			synonyms {
				total
				count
				hits {
					_id
					_name
					_nodeType
					_path
					displayName
					from
					thesaurus
					thesaurusReference
					to
				}
			}
			synonymsCount
		}
	}
}
*/
