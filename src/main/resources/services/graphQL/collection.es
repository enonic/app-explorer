//import {toStr} from '@enonic/js-utils';
//import getIn from 'get-value';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';
//import {list as listTasks} from '/lib/xp/task';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getDocumentCount} from '/lib/explorer/collection/getDocumentCount';
import {query} from '/lib/explorer/collection/query';
import {usedInInterfaces} from '/lib/explorer/collection/usedInInterfaces';

const {
	createObjectType
} = newSchemaGenerator();

/*const COLLECTIONS_INPUT_TYPE = createInputObjectType({
	name: 'CollectionsArguments',
	fields: {
		page: {
			type: GraphQLInt,
			default: 1,
			defaultValue: 1
		}
	}
}); // COLLECTIONS_INPUT_TYPE*/


const COLLECTION_OBJECT_TYPE = createObjectType({
	name: 'Collection',
	//description:
	fields: {
		_id: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString }, // TODO nonNull?
		_path: { type: nonNull(GraphQLString) },
		//type: { type: nonNull(GraphQLString) },
		//collecting: { type: GraphQLBoolean },
		collector: { type: createObjectType({
			name: 'CollectionCollector',
			//description: 'Collector description',
			fields: {
				name: { type: nonNull(GraphQLString) },
				configJson: { type: GraphQLString } // Can be null when no config yet...
			}
		})},

		// TODO remove in app-explorer-2.0.0
		cron: { type: list(createObjectType({
			name: 'Cron',
			//description: 'Cron description',
			fields: {
				month: { type: nonNull(GraphQLString) },
				dayOfMonth: { type: nonNull(GraphQLString) },
				dayOfWeek: { type: nonNull(GraphQLString) },
				hour: { type: nonNull(GraphQLString) },
				minute: { type: nonNull(GraphQLString) }
			}
		}))},
		doCollect: { type: GraphQLBoolean },

		documentCount: { type: nonNull(GraphQLInt) },
		interfaces: { type: list(GraphQLString)},
		language: { type: GraphQLString },
		schema: { type: GraphQLString }
	}
}); // COLLECTION_OBJECT_TYPE


export const queryCollectionsResolver = ({
	//count = -1,
	page,
	perPage,
	sort
} = {}) => {
	//log.info(`count:${toStr(count)}`);
	//log.info(`page:${toStr(page)}`);
	//log.info(`perPage:${toStr(perPage)}`);
	//log.info(`sort:${toStr(sort)}`);
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const collectionsRes = query({
		connection,
		page,
		perPage,
		sort
	});
	//log.info(`collectionsRes:${toStr(collectionsRes)}`);

	/*const activeCollections = {};
	listTasks({
		state: 'RUNNING'
	}).forEach((runningTask) => {
		//log.info(`runningTask:${toStr(runningTask)}`);
		const maybeJson = getIn(runningTask, 'progress.info');
		if (maybeJson) {
			try {
				const info = JSON.parse(maybeJson);
				if (info.name) {
					activeCollections[info.name] = true;
				}
			} catch (e) {
				//no-op
			}
		}
	});*/
	//log.info(`activeCollections:${toStr(activeCollections)}`);

	collectionsRes.hits = collectionsRes.hits.map(({
		_id,
		_name,
		_nodeType,
		_path,
		collector,
		cron, // TODO remove in app-explorer-2.0.0
		doCollect, // TODO remove in app-explorer-2.0.0
		language = '',
		schema//,
		//type
	}) => ({
		_id,
		_name,
		_nodeType,
		_path,
		//collecting: !!activeCollections[_name],
		collector,
		cron: Array.isArray(cron) ? cron : [cron], // TODO remove in app-explorer-2.0.0
		doCollect, // TODO remove in app-explorer-2.0.0
		documentCount: getDocumentCount(_name),
		interfaces: usedInInterfaces({connection, name: _name}),
		language,
		schema//,
		//type
	}));
	//log.info(`mapped collectionsRes:${toStr(collectionsRes)}`);
	return collectionsRes;
}; // queryCollectionsResolver


export const fieldCollectionsQuery = {
	args: {
		count: GraphQLInt,
		page: GraphQLInt,
		perPage: GraphQLInt,
		sort: GraphQLString,
		start: GraphQLInt
	},
	resolve: (env) => {
		//log.info(`env:${toStr(env)}`);
		return queryCollectionsResolver(env.args);
	},
	type: createObjectType({
		name: 'QueryCollections',
		//description:
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			page: { type: GraphQLInt },
			pageStart: { type: GraphQLInt },
			pageEnd: { type: GraphQLInt },
			pagesTotal: { type: GraphQLInt },
			hits: { type: list(COLLECTION_OBJECT_TYPE) }
		} // fields
	})
}; // fieldCollectionsQuery
