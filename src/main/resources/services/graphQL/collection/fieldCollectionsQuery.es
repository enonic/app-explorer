//import {toStr} from '@enonic/js-utils';
//import getIn from 'get-value';

import {
	GraphQLInt,
	GraphQLString
} from '/lib/graphql';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {getDocumentCount} from '/lib/explorer/collection/getDocumentCount';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {usedInInterfaces} from '/lib/explorer/collection/usedInInterfaces';


import {
	GQL_TYPE_COLLECTION_QUERY_RESULT
} from './types';


export const queryCollectionsResolver = ({
	//count, // Preferring perPage for now
	page,
	perPage,
	query,
	sort/*,
	start*/ // Preferring page for now
} = {}) => {
	//log.info(`count:${toStr(count)}`);
	//log.info(`page:${toStr(page)}`);
	//log.info(`perPage:${toStr(perPage)}`);
	//log.info(`sort:${toStr(sort)}`);
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const collectionsRes = queryCollections({
		connection,
		//count,
		page,
		perPage,
		query,
		sort/*,
		start*/
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
		_score,
		collector,
		language = '',
		documentTypeId//,
		//type
	}) => ({
		_id,
		_name,
		_nodeType,
		_path,
		_score,
		//collecting: !!activeCollections[_name],
		collector,
		documentCount: getDocumentCount(_name),
		interfaces: usedInInterfaces({connection, name: _name}),
		language,
		documentTypeId//,
		//type
	}));
	//log.info(`mapped collectionsRes:${toStr(collectionsRes)}`);
	return collectionsRes;
}; // queryCollectionsResolver


export const fieldCollectionsQuery = {
	args: {
		//count: GraphQLInt, // Prefering perPage for now
		page: GraphQLInt, // Preferring page for now
		perPage: GraphQLInt,
		query: GraphQLString,
		sort: GraphQLString//,
		//start: GraphQLInt
	},
	resolve: (env) => {
		//log.info(`env:${toStr(env)}`);
		return queryCollectionsResolver(env.args);
	},
	type: GQL_TYPE_COLLECTION_QUERY_RESULT
}; // fieldCollectionsQuery
