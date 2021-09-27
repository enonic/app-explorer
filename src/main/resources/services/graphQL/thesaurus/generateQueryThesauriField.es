//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/thesaurus/query';

import {querySynonyms} from '../synonym/querySynonyms';


export function generateQueryThesauriField({
	GQL_TYPE_COUNT,
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	//GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	GQL_TYPE_SYNONYM,
	GQL_TYPE_THESAURUS_LANGUAGE,
	GQL_TYPE_TOTAL,
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;
	const THESAURUS_OBJECT_TYPE = createObjectType({
		name: 'QueryThesauriHits',
		//description:
		fields: {
			_id: { type: GQL_TYPE_ID },
			_name: { type: GQL_TYPE_NAME },
			_nodeType: { type: GraphQLString }, // TODO nonNull?
			_path: { type: GQL_TYPE_PATH },
			description: { type: nonNull(GraphQLString) },
			//displayName: { type: nonNull(GraphQLString) },
			language: { type: GQL_TYPE_THESAURUS_LANGUAGE },
			synonyms: { type: GQL_TYPE_SYNONYM },
			synonymsCount: { type: nonNull(GraphQLInt) }//,
			//type: { type: nonNull(GraphQLString) }
		}
	}); // THESAURUS_OBJECT_TYPE
	return {
		resolve: (/*env*/) => {
			//log.info(`env:${toStr(env)}`);
			const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
			const thesauriRes = query({
				connection
			});
			thesauriRes.hits = thesauriRes.hits.map(({
				_nodeType,
				_path,
				description,
				id: _id,
				language,
				name: _name,
				//displayName,
				synonymsCount//,
				//type
			}) => ({
				_id,
				_name,
				_nodeType,
				_path,
				description,
				//displayName,
				language,
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
					}
				}),
				synonymsCount//,
				//type
			}));
			return thesauriRes;
		},
		type: createObjectType({
			name: 'QueryThesauri',
			//description:
			fields: {
				count: { type: GQL_TYPE_COUNT },
				hits: { type: list(THESAURUS_OBJECT_TYPE) },
				total: { type: GQL_TYPE_TOTAL }
			} // fields
		})
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
			language {
				from
				to
			}
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
