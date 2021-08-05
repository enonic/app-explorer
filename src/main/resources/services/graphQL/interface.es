import {
	forceArray//,
	//toStr
} from '@enonic/js-utils';

import {
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';


import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/interface/query';

const {
	createObjectType
} = newSchemaGenerator();


const INTERFACE_OBJECT_TYPE = createObjectType({
	name: 'Interface',
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		displayName: { type: nonNull(GraphQLString) },
		//name: { type: nonNull(GraphQLString) } // Same as displayName
		synonyms: { type: list(GraphQLString) }//,
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
			synonyms
		}
	}
}
*/
