//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	list
} from '/lib/graphql';
import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';
import {query} from '/lib/explorer/interface/query';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';

import {
	GQL_TYPE_INTERFACE_NAME
} from '../constants';


export function generateQueryInterfacesField({
	glue
}) {
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
			interfacesRes.hits = interfacesRes.hits
				.map((interfaceNode) => coerseInterfaceType(interfaceNode));
			return interfacesRes;
		},
		type: glue.addObjectType({
			name: 'QueryInterfaces',
			fields: {
				count: { type: glue.getScalarType('count') },
				hits: { type: list(glue.getObjectType(GQL_TYPE_INTERFACE_NAME)) },
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
			_nodeType
			_path
			_versionKey
			collectionIds
			fields
			stopWordIds
			synonymIds
		}
	}
}
*/
