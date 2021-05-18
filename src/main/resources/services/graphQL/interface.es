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
		highlightFragmenter: { type: GraphQLString }, // NOTE undefined allowed
		highlightNumberOfFragments: { type: GraphQLInt }, // NOTE undefined allowed
		highlightOrder: { type: GraphQLString }, // NOTE undefined allowed
		highlightPostTag: { type: GraphQLString }, // NOTE undefined allowed
		highlightPreTag: { type: GraphQLString }, // NOTE undefined allowed
		lengthLimit: { type: GraphQLInt }, // NOTE undefined allowed
		to: { type: nonNull(GraphQLString) },
		type: { type: nonNull(GraphQLString) } // string, tags
	}
});


const INTERFACE_OBJECT_TYPE = createObjectType({
	name: 'Interface',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		displayName: { type: nonNull(GraphQLString) },
		filters: { type: createObjectType({
			name: 'InterfaceFilters',
			//description:
			fields: {
				must: { type: list(INTERFACE_FILTER_OBJECT_TYPE) },
				mustNot: { type: list(INTERFACE_FILTER_OBJECT_TYPE) },
				should: { type: list(INTERFACE_FILTER_OBJECT_TYPE) }
			}
		}) },
		//name: { type: nonNull(GraphQLString) }, // Same as displayName
		queryJson: { type: GraphQLString },
		resultMappings: { type: list(RESULT_MAPPING_OBJECT_TYPE)}//,
		//type: { type: nonNull(GraphQLString) }
	}
}); // INTERFACE_OBJECT_TYPE

export const mapResultMappings = (resultMappings) => forceArray(resultMappings).map(({
	field,
	highlight = false,
	highlightFragmenter = highlight ? 'span' : undefined,
	highlightNumberOfFragments = highlight ? 1 : undefined,
	highlightOrder = highlight ? 'none' : undefined,
	highlightPostTag = highlight ? '</em>' : undefined,
	highlightPreTag = highlight ? '<em>' : undefined,
	lengthLimit = highlight ? 100 : undefined,
	to,
	type
}) => {
	let intOrUndefinedNumberOfFragments = parseInt(highlightNumberOfFragments, 10);
	if (!isInt(intOrUndefinedNumberOfFragments)) {
		intOrUndefinedNumberOfFragments = undefined;
	}

	let intOrUndefinedLengthLimit = parseInt(lengthLimit, 10);
	if (!isInt(intOrUndefinedLengthLimit)) {
		intOrUndefinedLengthLimit = undefined;
	}

	return {
		field,
		highlight,
		highlightFragmenter: highlight ? highlightFragmenter : undefined,
		highlightNumberOfFragments: highlight ? intOrUndefinedNumberOfFragments : undefined,
		highlightOrder: highlight ? highlightOrder : undefined,
		highlightPostTag: highlight ? highlightPostTag : undefined,
		highlightPreTag: highlight ? highlightPreTag : undefined,
		lengthLimit: intOrUndefinedLengthLimit,
		to,
		type
	};
});


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
			_nodeType,
			_path,
			displayName,
			filters: {
				must,
				mustNot,
				should
			},
			query,
			resultMappings//,
			//type
		}) => ({
			_id,
			_name,
			_nodeType,
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
				})) : null,
				should: should ? forceArray(should).map(({
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
			resultMappings: mapResultMappings(resultMappings)//,
			//type
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
				should {
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
