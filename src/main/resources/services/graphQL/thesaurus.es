//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/thesaurus/query';

import {GQL_TYPE_SYNONYM} from './synonym/types';
import {querySynonymsResolver} from './synonym/fieldSynonymsQuery';
import {typeThesaurusLanguage} from './thesaurus/typeThesaurusLanguage';


const {
	createObjectType
} = newSchemaGenerator();


const THESAURUS_OBJECT_TYPE = createObjectType({
	name: 'QueryThesauriHits',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		description: { type: nonNull(GraphQLString) },
		//displayName: { type: nonNull(GraphQLString) },
		language: { type: typeThesaurusLanguage },
		synonyms: { type: GQL_TYPE_SYNONYM },
		synonymsCount: { type: nonNull(GraphQLInt) }//,
		//type: { type: nonNull(GraphQLString) }
	}
}); // THESAURUS_OBJECT_TYPE


export const queryThesauri = {
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
			synonyms: querySynonymsResolver({
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
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(THESAURUS_OBJECT_TYPE) }
		} // fields
	})
}; // queryThesauri


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
