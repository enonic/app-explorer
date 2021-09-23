import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {referencedBy} from '/lib/explorer/node/referencedBy';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLFloat,
	GraphQLInt,
	newSchemaGenerator,
	nonNull,
	list
} from '/lib/graphql';

import {
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH
} from './types';


const {
	createObjectType
} = newSchemaGenerator();


export const fieldReferencedBy = {
	args: {
		_id: GQL_TYPE_ID
	},
	resolve({
		args: {
			_id
		}
	}) {
		const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
		const res = referencedBy({
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
	},
	type: createObjectType({
		name: 'referencedBy',
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
						_score: { type: nonNull(GraphQLFloat) }
					}
				}))
			},
			total: { type: nonNull(GraphQLInt) }
		}
	})
}; // fieldReferencedBy

/*
{
  referencedBy(_id: "7f3688f6-e466-4716-b649-ba75b9eec6e0") {
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
*/
