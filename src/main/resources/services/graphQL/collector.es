import {
	//createInputObjectType,
	createObjectType,
	//GraphQLBoolean,
	//GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
//import {toStr} from '/lib/util';


import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/collector/query';


const COLLECTOR_OBJECT_TYPE = createObjectType({
	name: 'Collector',
	//description:
	fields: {

		// TODO: These can be null until removed
		// We're not registering collectors as nodes anymore.
		//_id: { type: (GraphQLString) },
		//_name: { type: (GraphQLString) },
		//_nodeType: { type: GraphQLString },
		//_path: { type: (GraphQLString) },

		appName: { type: nonNull(GraphQLString) },
		collectTaskName: { type: nonNull(GraphQLString) },
		componentPath: { type: nonNull(GraphQLString) },
		configAssetPath: { type: nonNull(GraphQLString) },
		displayName: { type: nonNull(GraphQLString) }//,
		//type: { type: nonNull(GraphQLString) }
	}
}); // COLLECTOR_OBJECT_TYPE


export const queryCollectorsResolver = () => {
	const collectorsReq = query({
		connection: connect({ principals: [PRINCIPAL_EXPLORER_READ] })
	});
	//log.debug(`collectorsReq:${toStr({collectorsReq})}`);
	return collectorsReq;
}; // queryCollectorsResolver


export const queryCollectors = {
	resolve: (/*env*/) => {
		//log.info(`env:${toStr(env)}`);
		return queryCollectorsResolver();
	},
	type: createObjectType({
		name: 'QueryCollectors',
		//description:
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			/*page: { type: nonNull(GraphQLInt) },
			pageStart: { type: nonNull(GraphQLInt) },
			pageEnd: { type: nonNull(GraphQLInt) },
			pagesTotal: { type: nonNull(GraphQLInt) },*/
			hits: { type: list(COLLECTOR_OBJECT_TYPE) }
		} // fields
	})
}; // queryCollectors

/* Example query
{
	queryCollectors {
		total
		count
		hits {
			#_id
			#_name
			#_nodeType
			#_path
			appName
			collectTaskName
			configAssetPath
			displayName
			#type
		}
	}
}
*/
