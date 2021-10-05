import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/interface/query';

import {
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_INTERFACE_NAME
} from '../constants';


export function generateQueryInterfacesField({
	glue
}) {
	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);
	const INTERFACE_OBJECT_TYPE = glue.addObjectType({
		name: GQL_TYPE_INTERFACE_NAME,
		fields: {
			...interfaceNodeFields,
			displayName: { type: nonNull(GraphQLString) },
			//name: { type: nonNull(GraphQLString) } // Same as displayName
			synonyms: { type: list(GraphQLString) }//,
		},
		interfaces: [interfaceNodeType]
	}); // INTERFACE_OBJECT_TYPE
	return {
		args: {
			count: GraphQLInt
		},
		resolve: (env) => {
			//log.info(`env:${toStr(env)}`);
			const {count = -1} = env.args;
			const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
			const interfacesRes = query({
				connection,
				count
			});
			interfacesRes.hits = interfacesRes.hits.map(({
				_id,
				_name,
				_nodeType,
				_path,
				displayName,
				synonyms
			}) => ({
				_id,
				_name,
				_nodeType,
				_path,
				displayName,
				synonyms: forceArray(synonyms)
			}));
			return interfacesRes;
		},
		type: glue.addObjectType({
			name: 'QueryInterfaces',
			fields: {
				count: { type: glue.getScalarType('count') },
				hits: { type: list(INTERFACE_OBJECT_TYPE) },
				total: { type: glue.getScalarType('total') }
			} // fields
		})
	};
}

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
			synonyms
		}
	}
}
*/
