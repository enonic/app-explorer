import {
	addQueryFilter,
	isNotSet//,
	//toStr
} from '@enonic/js-utils';

import {NT_DOCUMENT_TYPE} from '/lib/explorer/documentType/constants';
import {
	NT_COLLECTION,
	NT_FIELD,
	NT_INTERFACE,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {hasValue} from '/lib/explorer/query/hasValue';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLInt,
	GraphQLString,
	list
} from '/lib/graphql';

import {
	GQL_QUERY_EXPLORER_REPO_NODES_GET_NAME,
	GQL_TYPE_EXPLORER_QUERY_RESULT_NAME,
	GQL_UNION_TYPE_ANY_NODE
} from './constants';


export const addExplorerRepoNodesGetQuery = ({glue}) => {
	glue.addQuery({
		args: {
			count: GraphQLInt,
			nodeTypes: list(GraphQLString),
			query: GraphQLString,
			start: GraphQLInt
		},
		name: GQL_QUERY_EXPLORER_REPO_NODES_GET_NAME,
		resolve(env) {
			//log.debug(`env:${toStr(env)}`);
			let {
				args: {
					count,
					nodeTypes,
					query,
					start
				}
			} = env;
			if (isNotSet(count)) {count = -1;}
			if (isNotSet(nodeTypes)) {nodeTypes = [
				NT_COLLECTION,
				NT_DOCUMENT_TYPE,
				NT_FIELD,
				NT_INTERFACE
			];}
			if (isNotSet(query)) {query = '';}
			if (isNotSet(start)) {start = 0;}
			const readConnection = connect({principals: [PRINCIPAL_EXPLORER_READ]});
			const queryParams = {
				count,
				query,
				start
			};
			if (nodeTypes) {
				queryParams.filters = addQueryFilter({
					filter: hasValue('_nodeType', nodeTypes)
				});
			}
			//log.debug(`queryParams:${toStr(queryParams)}`);

			const queryRes = readConnection.query(queryParams);
			//log.debug(`queryRes:${toStr(queryRes)}`);

			queryRes.hits = queryRes.hits.map(({id, score}) => ({
				...readConnection.get(id),
				_score: score
			}));
			//log.debug(`queryRes:${toStr(queryRes)}`);

			return queryRes;
		},
		type: glue.addObjectType({
			name: GQL_TYPE_EXPLORER_QUERY_RESULT_NAME,
			fields: {
				count: { type: glue.getScalarType('count') },
				hits: {
					type: list(glue.getUnionTypeObj(GQL_UNION_TYPE_ANY_NODE).type)
				},
				total: { type: glue.getScalarType('total') }
			}
		})
	});
};
