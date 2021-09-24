import {
	forceArray,
	toStr
} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {referencedBy as referencedByQuery} from '/lib/explorer/node/referencedBy';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLFloat,
	GraphQLInt,
	nonNull,
	list,
	reference
} from '/lib/graphql';

import {
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH
} from './types';


const GQL_TYPE_REFERENCED_BY = 'referencedBy';


function referencedById(_id) {
	log.debug(`_id:${toStr(_id)}`);
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const res = referencedByQuery({
		_id,
		connection
	});
	//log.debug(`res:${toStr(res)}`);

	const nodes = connection.get(res.hits.map(({id}) => id));
	//log.debug(`nodes:${toStr(nodes)}`);

	const nodesObj = {};
	forceArray(nodes).forEach(({
		_id,
		_name,
		_nodeType,
		_path
	}) => {
		nodesObj[_id] = {
			_name,
			_nodeType,
			_path
		};
	});
	//log.debug(`nodesObj:${toStr(nodesObj)}`);

	res.hits = res.hits.map(({
		id,
		score
	}) => ({
		...nodesObj[id],
		_id: id,
		_score: score
	}));

	//log.debug(`res:${toStr(res)}`);
	return res;
} // referencedById


export function generateFieldReferencedBy(createObjectType) {
	return {
		args: {
			_id: GQL_TYPE_ID
		},
		resolve: ({args: {_id}}) => referencedById(_id),
		type: createObjectType({
			name: GQL_TYPE_REFERENCED_BY,
			fields: {
				count: { type: nonNull(GraphQLInt) },
				hits: {
					type: list(createObjectType({
						name: 'referencedByHits',
						fields: {
							_id: { type: GQL_TYPE_ID },
							_name: { type: GQL_TYPE_NAME },
							_nodeType: { type: GQL_TYPE_NODE_TYPE },
							_path: { type: GQL_TYPE_PATH },
							_score: { type: nonNull(GraphQLFloat) },
							referencedBy: {
								resolve: ({source: {_id}}) => referencedById(_id),
								type: reference(GQL_TYPE_REFERENCED_BY)
							}
						}
					}))
				},
				total: { type: nonNull(GraphQLInt) }
			}
		})
	};
}

/*
query QueryReferencedBy(
  $_id: ID!
) {
	referencedBy(_id: $_id) {
		count
		hits {
			_id
			_name
			_nodeType
			_path
			_score
			referencedBy {
				count
				hits {
					_id
					_name
					_nodeType
					_path
					_score
				}
				total
			}
		}
		total
	}
}
*/
