import {
	//createInputObjectType,
	createObjectType,
	GraphQLBoolean,
	//GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
import {forceArray} from '/lib/util/data';
import {isInt} from '/lib/util/value';
//import {toStr} from '/lib/util';


import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/interface/query';


const INTERFACE_FILTER_OBJECT_TYPE = createObjectType({
	name: 'InterfaceFilter',
	//description:
	fields: {
		filter: { type: nonNull(GraphQLString) },
		params: { type: nonNull(createObjectType({
			name: 'InterfaceFilterParams',
			//description:
			fields: {
				field: { type: nonNull(GraphQLString) },
				values: { type: list(GraphQLString) }
			}
		})) }
	}
});


//const QUERY_PARAMS_OBJECT_TYPE = ;


/*const QUERY_OBJECT_TYPE = createObjectType({
	name: 'Query',
	//description:
	fields: {
		operator: { type: GraphQLString },
		params: { type: createObjectType({
			name: 'Query',
			//description:
			fields: {
				expressions: { type: list(QUERY_OBJECT_TYPE)}, // Recursive type possible?
				fields: { type: list(createObjectType({
					name: 'QueryFields',
					//description:
					fields: {
						boost: { type: nonNull(GraphQLInt)},
						field: { type: nonNull(GraphQLString)}
					}
				})) }
			}
		})},
		type: { type: nonNull(GraphQLString) }
	}
});*/


const RESULT_MAPPING_OBJECT_TYPE = createObjectType({
	name: 'ResultMapping',
	//description:
	fields: {
		field: { type: nonNull(GraphQLString) },
		highlight: { type: nonNull(GraphQLBoolean) },
		highlightFragmenter: { type: GraphQLString }, // TODO nonNull?
		highlightNumberOfFragments: { type: GraphQLBoolean}, // TODO nonNull?
		highlightOrder: { type: GraphQLString }, // TODO nonNull?
		highlightPostTag: { type: GraphQLString }, // TODO nonNull?
		highlightPreTag: { type: GraphQLString }, // TODO nonNull?
		lengthLimit: { type: GraphQLInt },
		to: { type: nonNull(GraphQLString) },
		type: { type: nonNull(GraphQLString) }
	}
});


const INTERFACE_OBJECT_TYPE = createObjectType({
	name: 'Interface',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_path: { type: nonNull(GraphQLString) },
		displayName: { type: nonNull(GraphQLString) },
		filters: { type: createObjectType({
			name: 'InterfaceFilters',
			//description:
			fields: {
				must: { type: list(INTERFACE_FILTER_OBJECT_TYPE) },
				mustNot: { type: list(INTERFACE_FILTER_OBJECT_TYPE) }
			}
		}) },
		//name: { type: nonNull(GraphQLString) }, // Same as displayName
		queryJson: { type: GraphQLString },
		resultMappings: { type: list(RESULT_MAPPING_OBJECT_TYPE)},
		type: { type: nonNull(GraphQLString) }
	}
}); // INTERFACE_OBJECT_TYPE


export const queryInterfaces = {
	resolve: (/*env*/) => {
		//log.info(`env:${toStr(env)}`);
		const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
		const interfacesRes = query({
			connection
		});
		interfacesRes.hits = interfacesRes.hits.map(({
			_id,
			_name,
			_path,
			displayName,
			filters: {
				must,
				mustNot
			},
			query,
			resultMappings,
			type
		}) => ({
			_id,
			_name,
			_path,
			displayName,
			filters: {
				must: must ? forceArray(must).map(({
					filter,
					params: {field, values}
				}) => ({
					filter,
					params: {
						field,
						values: values ? forceArray(values) : null
					}
				})) : null,
				mustNot: mustNot ? forceArray(mustNot).map(({
					filter,
					params: {field, values}
				}) => ({
					filter,
					params: {
						field,
						values: values ? forceArray(values) : null
					}
				})) : null
			},
			queryJson: query ? JSON.stringify(query) : null,
			resultMappings: forceArray(resultMappings).map(({
				field,
				highlight,
				highlightFragmenter = 'span',
				highlightNumberOfFragments = 1,
				highlightOrder = 'none',
				highlightPostTag = '</em>',
				highlightPreTag = '<em>',
				lengthLimit,
				to,
				type
			}) => ({
				field,
				highlight,
				highlightFragmenter,
				highlightNumberOfFragments,
				highlightOrder,
				highlightPostTag,
				highlightPreTag,
				lengthLimit: isInt(lengthLimit) ? lengthLimit : null,
				to,
				type
			})),
			type
		}));
		return interfacesRes;
	},
	type: createObjectType({
		name: 'QueryInterfaces',
		//description:
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(INTERFACE_OBJECT_TYPE) }
		} // fields
	})
}; // queryInterfaces


/* Example query
{
	queryInterfaces {
		total
		count
		hits {
			_id
			_name
			_path
			displayName
			filters {
        		must {
          			filter
          			params {
            			field
        				values
      				}
        		}
        		mustNot {
          			filter
          			params {
            			field
            			values
          			}
        		}
      		}
			queryJson
			resultMappings {
				field
				highlight
				lengthLimit
				to
				type
			}
			type
		}
	}
}
*/
