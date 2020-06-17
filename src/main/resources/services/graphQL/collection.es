import {
	//createInputObjectType,
	createObjectType,
	GraphQLBoolean,
	//GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';
import {toStr} from '/lib/util';


import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query} from '/lib/explorer/collection/query';


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
		_path: { type: nonNull(GraphQLString) },
		_name: { type: nonNull(GraphQLString) },
		displayName: { type: nonNull(GraphQLString) },
		type: { type: nonNull(GraphQLString) },
		collector: { type: createObjectType({
			name: 'CollectionCollector',
			//description: 'Collector description',
			fields: {
				name: { type: nonNull(GraphQLString) },
				configJson: { type: nonNull(GraphQLString) }
			}
		})},
		cron: { type: createObjectType({
			name: 'Cron',
			//description: 'Cron description',
			fields: {
				month: { type: nonNull(GraphQLString) },
				dayOfMonth: { type: nonNull(GraphQLString) },
				dayOfWeek: { type: nonNull(GraphQLString) },
				hour: { type: nonNull(GraphQLString) },
				minute: { type: nonNull(GraphQLString) }
			}
		})},
		doCollect: { type: GraphQLBoolean }
	}
}); // COLLECTION_OBJECT_TYPE


export const queryCollections = {
	args: {
		page: GraphQLInt,
		perPage: GraphQLInt,
		sort: GraphQLString
	},
	resolve: (env) => {
		log.info(`env:${toStr(env)}`);
		const {args: {
			page = 1,
			perPage = 10,
			sort
		}} = env;
		log.info(`page:${toStr(page)}`);
		log.info(`perPage:${toStr(perPage)}`);
		log.info(`sort:${toStr(sort)}`);
		const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
		const collectionsRes = query({
			connection,
			page,
			perPage,
			sort
		});
		log.info(`collectionsRes:${toStr(collectionsRes)}`);
		collectionsRes.hits = collectionsRes.hits.map(({
			_id,
			_path,
			_name,
			collector,
			cron,
			displayName,
			doCollect,
			type
		}) => ({
			_id,
			_path,
			_name,
			collector,
			cron,
			displayName,
			doCollect,
			type
		}));
		log.info(`mapped collectionsRes:${toStr(collectionsRes)}`);
		return collectionsRes;
	},
	type: createObjectType({
		name: 'QueryCollections',
		//description:
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			page: { type: nonNull(GraphQLInt) },
			pageStart: { type: nonNull(GraphQLInt) },
			pageEnd: { type: nonNull(GraphQLInt) },
			pagesTotal: { type: nonNull(GraphQLInt) },
			hits: { type: list(COLLECTION_OBJECT_TYPE) }
		} // fields
	})
} // queryCollections

/* Example query
{
  queryCollections(
    page: 1
    perPage: 1
    sort: "displayName ASC"
  ) {
    total
    count
    page
    pageStart
    pageEnd
    pagesTotal
    hits {
    	_id
    	_path
    	_name
    	displayName
    	type
    	cron {
	      month
	      dayOfMonth
	      dayOfWeek
	      hour
	      minute
	    }
	    doCollect
	    collector {
	      name
	      configJson
	    }
    }
  }
}
*/
