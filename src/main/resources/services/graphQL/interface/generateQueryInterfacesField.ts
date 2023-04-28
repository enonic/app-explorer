import type {Interface} from '@enonic-types/lib-explorer';


//import {toStr} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';
import {coerseInterfaceType} from '/lib/explorer/interface/coerseInterfaceType';
import {query as queryInterfaces} from '/lib/explorer/interface/query';
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
			count: GraphQLInt,
			query: GraphQLString
		},
		resolve: (env :{
			args :{
				count ?:number
				query ?:string
			}
		}) => {
			//log.info(`env:${toStr(env)}`);
			const {
				count = -1,
				query = ''
			} = env.args;
			const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
			const interfacesRes = queryInterfaces({
				connection,
				count,
				query
			});
			const rv :{
				count :number
				hits :Array<Interface>
				total :number
			} = {
				count: interfacesRes.count,
				hits: interfacesRes.hits
					.map((interfaceNode) => coerseInterfaceType(interfaceNode)),
				total: interfacesRes.count
			};
			return rv;
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
			termQueries
		}
	}
}
*/
