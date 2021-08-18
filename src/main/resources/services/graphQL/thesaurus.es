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
import {query as qS} from '/lib/explorer/synonym/query';
import {query} from '/lib/explorer/thesaurus/query';

import {QUERY_FILTERS_INPUT_OBJECT_TYPE} from './noQL';
import {typeThesaurusLanguage} from './thesaurus/typeThesaurusLanguage';
const {
	createObjectType
} = newSchemaGenerator();


const SYNONYM_OBJECT_TYPE = createObjectType({
	name: 'Synonym',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		from: { type: nonNull(list(nonNull(GraphQLString))) },
		displayName: { type: nonNull(GraphQLString) },
		thesaurus: { type: nonNull(GraphQLString) },
		thesaurusReference: { type: nonNull(GraphQLString) },
		to: { type: nonNull(list(nonNull(GraphQLString))) }//,
		//type: { type: nonNull(GraphQLString) }
	}
}); // SYNONYM_OBJECT_TYPE


const QUERY_SYNONYMS_OBJECT_TYPE = createObjectType({
	name: 'QuerySynonyms',
	//description:
	fields: {
		total: { type: nonNull(GraphQLInt) },
		count: { type: nonNull(GraphQLInt) },
		hits: { type: list(SYNONYM_OBJECT_TYPE) }
	} // fields
}); // QUERY_SYNONYMS_OBJECT_TYPE


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
		synonyms: { type: QUERY_SYNONYMS_OBJECT_TYPE },
		synonymsCount: { type: nonNull(GraphQLInt) }//,
		//type: { type: nonNull(GraphQLString) }
	}
}); // THESAURUS_OBJECT_TYPE


const querySynonymsResolver = ({
	count,
	filters = {},
	query,
	sort,
	start
}) => {
	//log.info(`filters:${toStr(filters)}`);
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const synonymsRes = qS({
		connection,
		count,
		filters,
		query,
		sort,
		start
	});
	//log.info(`synonymsRes:${toStr(synonymsRes)}`);
	synonymsRes.hits = synonymsRes.hits.map(({
		_path,
		_nodeType,
		id: _id,
		name: _name,
		displayName,
		from,
		thesaurus,
		thesaurusReference,
		to//,
		//type
	}) => ({
		_id,
		_name,
		_nodeType,
		_path,
		displayName,
		from,
		thesaurus,
		thesaurusReference,
		to//,
		//type
	}));
	return synonymsRes;
}; // querySynonymsResolver


export const querySynonyms = {
	args: {
		count: GraphQLInt,
		filters: QUERY_FILTERS_INPUT_OBJECT_TYPE,
		query: GraphQLString,
		sort: GraphQLString,
		start: GraphQLInt
	},
	resolve: (env) => {
		//log.info(`env:${toStr(env)}`);
		return querySynonymsResolver(env.args);
	},
	type: QUERY_SYNONYMS_OBJECT_TYPE
}; // queryThesauri


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
	querySynonyms(
		count: -1
		filters: {
	  		boolean: {
				must: {
		  			hasValue: {
						field: "thesaurusReference"
						values: [
							"dce02ab6-f851-4ee9-a84f-28dcd3027eee"
		  				]
		  			}
				}
	  		}
		}
		query: "thesaurusReference = 'dce02ab6-f851-4ee9-a84f-28dcd3027eee'"
		sort: "_from ASC"
		start: 0
	) {
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
			#type
		}
	}
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
