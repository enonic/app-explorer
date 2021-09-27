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


export function generateQueryInterfacesField({
	GQL_TYPE_COUNT,
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	//GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	GQL_TYPE_TOTAL,
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;
	const INTERFACE_OBJECT_TYPE = createObjectType({
		name: 'Interface',
		fields: {
			_id: { type: GQL_TYPE_ID },
			_name: { type: GQL_TYPE_NAME },
			_nodeType: { type: GraphQLString }, // TODO nonNull?
			_path: { type: GQL_TYPE_PATH },
			displayName: { type: nonNull(GraphQLString) },
			//name: { type: nonNull(GraphQLString) } // Same as displayName
			synonyms: { type: list(GraphQLString) }//,
		}
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
		type: createObjectType({
			name: 'QueryInterfaces',
			fields: {
				count: { type: GQL_TYPE_COUNT },
				hits: { type: list(INTERFACE_OBJECT_TYPE) },
				total: { type: GQL_TYPE_TOTAL }
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
