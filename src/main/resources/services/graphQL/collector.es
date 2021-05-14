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
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		appName: { type: nonNull(GraphQLString) },
		collectTaskName: { type: nonNull(GraphQLString) },
		configAssetPath: { type: nonNull(GraphQLString) },
		displayName: { type: nonNull(GraphQLString) }//,
		//type: { type: nonNull(GraphQLString) }
	}
}); // COLLECTOR_OBJECT_TYPE


export const queryCollectorsResolver = () => {
	const collectorsReq = query({
		connection: connect({ principals: [PRINCIPAL_EXPLORER_READ] })
	});
	//log.info(`collectorsReq:${toStr(collectorsReq)}`);
	collectorsReq.hits = collectorsReq.hits.map(({
		_id,
		_name,
		_nodeType,
		_path,
		appName,
		collectTaskName,
		configAssetPath,
		displayName//,
		//type
	}) => ({
		_id,
		_name,
		_nodeType,
		_path,
		appName,
		collectTaskName,
		configAssetPath,
		displayName//,
		//type
	}));
	//log.info(`mapped collectorsReq:${toStr(collectorsReq)}`);
	return collectorsReq;
}; // queryCollectorsResolver


export const queryCollectors = {
	resolve: (env) => {
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
			_id
			_name
			_nodeType
			_path
			appName
			collectTaskName
			configAssetPath
			displayName
			#type
		}
	}
}
*/
